use anyhow::{Context, Result};
use chrono::Datelike;
use gray_matter::Matter;
use gray_matter::engine::YAML;
use markdown::{CompileOptions, Options, ParseOptions, to_html_with_options};
use minijinja::{Environment, context};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use syntect::highlighting::ThemeSet;
use syntect::html::highlighted_html_for_string;
use syntect::parsing::SyntaxSet;
use walkdir::WalkDir;

const HOST: &str = "https://www.fvoron.com";
const CONTACT_EMAIL: &str = "dev@fvoron.com";
const DEFAULT_TITLE: &str = "François Voron";
const DEFAULT_DESCRIPTION: &str = "I build high-quality softwares with the best technologies to achieve your business goals in a fast-changing environment. Free 30-minutes call to talk about your project.";
const DEFAULT_IMAGE_PATH: &str = "/meta-image.jpg";

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Meta {
    title: String,
    description: String,
    image: Option<String>,
    url: String,
    canonical: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct BlogPost {
    title: String,
    slug: String,
    date: String,
    formatted_date: String,
    tags: Vec<String>,
    excerpt: String,
    thumbnail: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    canonical: Option<String>,
    content: String,
    html: String,
    headings: Vec<Heading>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Heading {
    text: String,
    level: usize,
    slug: String,
}

/// Apply syntax highlighting to code blocks in HTML
fn apply_syntax_highlighting(html: &str) -> Result<String> {
    use syntect::highlighting::Color;

    let ps = SyntaxSet::load_defaults_newlines();
    let ts = ThemeSet::load_defaults();
    let mut theme = ts.themes["base16-eighties.dark"].clone();
    // Set background to match terminal background color #0a0a0a
    theme.settings.background = Some(Color {
        r: 10,
        g: 10,
        b: 10,
        a: 255,
    });

    // Match <pre><code> blocks with or without language class
    let code_pattern =
        regex::Regex::new(r#"<pre><code(?:\s+class="language-([^"]+)")?>([\s\S]*?)</code></pre>"#)
            .unwrap();

    let result = code_pattern.replace_all(html, |caps: &regex::Captures| {
        let lang = caps.get(1).map(|m| m.as_str()).unwrap_or("txt");
        let code = caps.get(2).unwrap().as_str();

        // Decode HTML entities
        let decoded = code
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&amp;", "&")
            .replace("&quot;", "\"")
            .replace("&#39;", "'");

        // Render mermaid diagrams without syntax highlighting for proper initialization
        if lang.eq_ignore_ascii_case("mermaid") {
            return format!("<pre class=\"mermaid\">{}</pre>", decoded);
        }

        // Find syntax for the language
        let syntax = ps
            .find_syntax_by_extension(lang)
            .or_else(|| ps.find_syntax_by_token(lang))
            .unwrap_or_else(|| ps.find_syntax_plain_text());

        // Generate highlighted HTML
        highlighted_html_for_string(&decoded, &ps, syntax, &theme)
            .unwrap_or_else(|_| format!("<pre><code>{}</code></pre>", code))
    });

    Ok(result.to_string())
}

/// Slugify a string to make it URL-safe
fn slugify(text: &str) -> String {
    text.to_lowercase()
        .chars()
        .map(|c| {
            if c.is_alphanumeric() {
                c
            } else if c.is_whitespace() || c == '-' {
                '-'
            } else {
                ' '
            }
        })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<&str>>()
        .join("-")
}

/// Extract headings from HTML and add IDs (preserving document order)
fn process_headings(html: &str) -> Result<(String, Vec<Heading>)> {
    let mut headings = Vec::new();
    let mut result = html.to_string();

    // We need to collect all heading positions first, then process them in order
    #[derive(Debug)]
    struct HeadingMatch {
        start: usize,
        end: usize,
        level: usize,
        text: String,
    }

    let mut matches = Vec::new();

    // Find all headings
    for level in 1..=6 {
        let pattern_str = format!(r"<h{}>(.*?)</h{}>", level, level);
        let heading_pattern = regex::Regex::new(&pattern_str).unwrap();

        for cap in heading_pattern.captures_iter(&result) {
            let m = cap.get(0).unwrap();
            let text = cap.get(1).unwrap().as_str();
            matches.push(HeadingMatch {
                start: m.start(),
                end: m.end(),
                level,
                text: text.to_string(),
            });
        }
    }

    // Sort by position to preserve document order
    matches.sort_by_key(|m| m.start);

    // Process headings from end to start (to preserve indices)
    for heading_match in matches.iter().rev() {
        // Strip HTML tags from text for slug generation
        let text_pattern = regex::Regex::new(r"<[^>]+>").unwrap();
        let plain_text = text_pattern.replace_all(&heading_match.text, "");

        let slug = format!("header-{}", slugify(&plain_text));

        // Insert heading at the beginning (since we're processing in reverse)
        headings.insert(
            0,
            Heading {
                text: plain_text.to_string(),
                level: heading_match.level,
                slug: slug.clone(),
            },
        );

        let replacement = format!(
            "<h{} id=\"{}\">{}</h{}>",
            heading_match.level, slug, heading_match.text, heading_match.level
        );

        result.replace_range(heading_match.start..heading_match.end, &replacement);
    }

    Ok((result, headings))
}

fn parse_blog_post(path: &Path) -> Result<BlogPost> {
    let content = fs::read_to_string(path)?;
    let matter = Matter::<YAML>::new();
    let result = matter.parse(&content);

    let data: Value = result
        .data
        .ok_or_else(|| anyhow::anyhow!("Missing frontmatter"))?
        .deserialize()?;

    let title = data["title"]
        .as_str()
        .ok_or_else(|| anyhow::anyhow!("Missing title"))?
        .to_string();

    let date = data["date"]
        .as_str()
        .ok_or_else(|| anyhow::anyhow!("Missing date"))?
        .to_string();

    // Format the date for display (ISO format YYYY-MM-DD)
    let formatted_date = if let Ok(parsed_datetime) = chrono::DateTime::parse_from_rfc3339(&date) {
        parsed_datetime.format("%Y-%m-%d").to_string()
    } else if let Ok(parsed_date) = chrono::NaiveDate::parse_from_str(&date, "%Y-%m-%d") {
        parsed_date.format("%Y-%m-%d").to_string()
    } else {
        date.clone()
    };

    let tags: Vec<String> = data["tags"]
        .as_array()
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    let excerpt = data["excerpt"].as_str().unwrap_or("").to_string();

    let thumbnail = data["thumbnail"].as_str().unwrap_or("").to_string();

    let canonical = data["canonical"].as_str().map(String::from);

    let slug = path
        .file_stem()
        .and_then(|s| s.to_str())
        .context("Invalid filename")?
        .to_string();

    let markdown_content = result.content;

    // Parse markdown to HTML
    let options = Options {
        parse: ParseOptions::gfm(),
        compile: CompileOptions {
            allow_dangerous_html: true,
            allow_dangerous_protocol: true,
            ..CompileOptions::default()
        },
    };

    let mut html = to_html_with_options(&markdown_content, &options)
        .map_err(|e| anyhow::anyhow!("Failed to parse markdown: {:?}", e))?;

    // Apply syntax highlighting to code blocks
    html = apply_syntax_highlighting(&html)?;

    // Extract headings and add IDs
    let (html, headings) = process_headings(&html)?;

    Ok(BlogPost {
        title,
        slug,
        date,
        formatted_date,
        tags,
        excerpt,
        thumbnail,
        canonical,
        content: markdown_content,
        html,
        headings,
    })
}

fn get_all_posts() -> Result<Vec<BlogPost>> {
    let posts_dir = Path::new("../posts");
    let mut posts = Vec::new();

    for entry in WalkDir::new(posts_dir)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("md") {
            if let Ok(post) = parse_blog_post(path) {
                posts.push(post);
            }
        }
    }

    // Sort by date, newest first
    posts.sort_by(|a, b| b.date.cmp(&a.date));

    Ok(posts)
}

fn get_all_tags(posts: &[BlogPost]) -> HashMap<String, String> {
    let mut tags = HashMap::new();
    for post in posts {
        for tag in &post.tags {
            let normalized = normalize_tag(tag);
            tags.insert(normalized, tag.clone());
        }
    }
    tags
}

fn normalize_tag(tag: &str) -> String {
    tag.to_lowercase().replace(' ', "-")
}

fn build_meta(
    title: Option<&str>,
    description: Option<&str>,
    image: Option<&str>,
    url: &str,
    canonical: Option<&str>,
) -> Meta {
    let resolved_title = title.unwrap_or(DEFAULT_TITLE).to_string();
    let resolved_description = description.unwrap_or(DEFAULT_DESCRIPTION).to_string();
    let resolved_image = image
        .map(|img| img.to_string())
        .or_else(|| Some(format!("{}{}", HOST, DEFAULT_IMAGE_PATH)));
    let resolved_canonical = canonical.map(|c| c.to_string());

    Meta {
        title: resolved_title,
        description: resolved_description,
        image: resolved_image,
        url: url.to_string(),
        canonical: resolved_canonical,
    }
}

fn setup_templates() -> Result<Environment<'static>> {
    let mut env = Environment::new();

    // Load base template first
    let base_content = fs::read_to_string("templates/base.html")?;
    env.add_template_owned("base".to_string(), base_content)?;

    // Load other templates
    let template_dir = Path::new("templates");
    for entry in fs::read_dir(template_dir)? {
        let entry = entry?;
        let path = entry.path();
        let name = path.file_stem().and_then(|s| s.to_str()).map(String::from);

        if let Some(name) = name {
            if name == "base" {
                continue; // Skip base, already loaded
            }
            if path.extension().and_then(|s| s.to_str()) == Some("html") {
                let content = fs::read_to_string(&path)?;
                env.add_template_owned(name, content)?;
            }
        }
    }

    Ok(env)
}

// Helper trait to add templates with owned strings
trait AddTemplateOwned {
    fn add_template_owned(&mut self, name: String, source: String) -> Result<(), minijinja::Error>;
}

impl AddTemplateOwned for Environment<'static> {
    fn add_template_owned(&mut self, name: String, source: String) -> Result<(), minijinja::Error> {
        let name_leaked: &'static str = Box::leak(name.into_boxed_str());
        let source_leaked: &'static str = Box::leak(source.into_boxed_str());
        self.add_template(name_leaked, source_leaked)
    }
}

fn generate_site() -> Result<()> {
    println!("Generating static site...");

    // Create output directory
    let dist_dir = Path::new("dist");
    if dist_dir.exists() {
        fs::remove_dir_all(dist_dir)?;
    }
    fs::create_dir_all(dist_dir)?;

    // Get all posts
    let posts = get_all_posts()?;
    println!("Found {} blog posts", posts.len());

    // Get all tags
    let tags = get_all_tags(&posts);

    // Setup templates
    let env = setup_templates()?;

    // Generate index page
    let template = env.get_template("index")?;
    let meta = build_meta(
        Some("François Voron - Software engineer & open-source maintainer"),
        None,
        None,
        "/",
        None,
    );
    let rendered = template.render(context! {
        host => HOST,
        current_year => chrono::Utc::now().year(),
        title => meta.title,
        description => meta.description,
        image => meta.image,
        url => meta.url,
        canonical => meta.canonical,
    })?;
    fs::write(dist_dir.join("index.html"), rendered)?;
    println!("Generated index.html");

    // Generate blog index
    fs::create_dir_all(dist_dir.join("blog"))?;
    let template = env.get_template("blog")?;
    let meta = build_meta(Some("Blog - François Voron"), None, None, "/blog", None);
    let rendered = template.render(context! {
        host => HOST,
        posts => &posts,
        tags => &tags,
        title => meta.title,
        description => meta.description,
        image => meta.image,
        url => meta.url,
        canonical => meta.canonical,
    })?;
    fs::write(dist_dir.join("blog").join("index.html"), rendered)?;
    println!("Generated blog/index.html");

    // Generate individual blog posts
    let template = env.get_template("post")?;
    for post in &posts {
        let post_dir = dist_dir.join("blog").join(&post.slug);
        fs::create_dir_all(&post_dir)?;
        let image = if post.thumbnail.is_empty() {
            None
        } else {
            Some(format!("{}{}", HOST, post.thumbnail))
        };
        let meta = build_meta(
            Some(&format!("{} - François Voron", post.title)),
            Some(&post.excerpt),
            image.as_deref(),
            &format!("/blog/{}", post.slug),
            post.canonical.as_deref(),
        );
        let rendered = template.render(context! {
            host => HOST,
            post => post,
            title => meta.title,
            description => meta.description,
            image => meta.image,
            url => meta.url,
            canonical => meta.canonical,
        })?;
        fs::write(post_dir.join("index.html"), rendered)?;
        println!("Generated blog/{}/index.html", post.slug);
    }

    // Generate tag pages
    for (normalized_tag, tag) in &tags {
        let tag_posts: Vec<&BlogPost> = posts
            .iter()
            .filter(|p| p.tags.iter().any(|t| normalize_tag(t) == *normalized_tag))
            .collect();

        let tag_dir = dist_dir.join("blog").join("tag").join(normalized_tag);
        fs::create_dir_all(&tag_dir)?;

        let template = env.get_template("blog")?;
        let meta = build_meta(
            Some(&format!("{} - Blog - François Voron", tag)),
            None,
            None,
            &format!("/blog/tag/{}", normalized_tag),
            None,
        );
        let rendered = template.render(context! {
            host => HOST,
            posts => tag_posts,
            tags => &tags,
            current_tag => normalized_tag,
            current_tag_name => tag,
            title => meta.title,
            description => meta.description,
            image => meta.image,
            url => meta.url,
            canonical => meta.canonical,
        })?;
        fs::write(tag_dir.join("index.html"), rendered)?;
        println!("Generated blog/tag/{}/index.html", normalized_tag);
    }

    // Generate terms page
    let terms_dir = dist_dir.join("terms");
    fs::create_dir_all(&terms_dir)?;
    let template = env.get_template("terms")?;
    let meta = build_meta(
        Some("Legal terms - François Voron"),
        None,
        None,
        "/terms",
        None,
    );
    let rendered = template.render(context! {
        host => HOST,
        title => meta.title,
        description => meta.description,
        image => meta.image,
        url => meta.url,
        canonical => meta.canonical,
    })?;
    fs::write(terms_dir.join("index.html"), rendered)?;
    println!("Generated terms/index.html");

    // Generate opensource page
    let opensource_dir = dist_dir.join("open-source");
    fs::create_dir_all(&opensource_dir)?;

    let meta = Meta {
        title: format!("{} - Open Source", DEFAULT_TITLE),
        description: "Open-source projects I maintain and contribute to".to_string(),
        image: Some(DEFAULT_IMAGE_PATH.to_string()),
        url: "/open-source".to_string(),
        canonical: Some(format!("{}/open-source", HOST)),
    };
    let template = env.get_template("opensource").context(
        "Failed to load opensource template. Make sure it exists in the templates directory.",
    )?;
    let rendered = template.render(context! {
        host => HOST,
        title => meta.title,
        description => meta.description,
        image => meta.image,
        url => meta.url,
        canonical => meta.canonical,
    })?;
    fs::write(opensource_dir.join("index.html"), rendered)?;
    println!("Generated open-source/index.html");

    // Generate Atom feed
    generate_atom_feed(&posts, dist_dir)?;

    // Copy static files
    copy_static_files()?;

    println!("Site generation complete!");

    Ok(())
}

fn generate_atom_feed(posts: &[BlogPost], dist_dir: &Path) -> Result<()> {
    let mut feed = String::from(
        r#"<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">"#,
    );

    feed.push_str("\n  <title>François Voron</title>");
    feed.push_str("\n  <subtitle>Experiments, thoughts and stories about my work</subtitle>");
    feed.push_str(&format!(
        "\n  <link rel=\"self\" href=\"{}/feed.xml\" />",
        HOST
    ));

    if let Some(first_post) = posts.first() {
        feed.push_str(&format!("\n  <updated>{}</updated>", first_post.date));
    }

    feed.push_str("\n  <author>");
    feed.push_str("\n    <name>François Voron</name>");
    feed.push_str(&format!("\n    <email>{}</email>", CONTACT_EMAIL));
    feed.push_str("\n  </author>");
    feed.push_str(&format!("\n  <id>{}/blog</id>", HOST));

    for post in posts {
        feed.push_str("\n  <entry>");
        feed.push_str(&format!(
            "\n    <title>{}</title>",
            html_escape(&post.title)
        ));
        feed.push_str(&format!(
            "\n    <link href=\"{}/blog/{}\" />",
            HOST, post.slug
        ));
        feed.push_str(&format!("\n    <id>{}/blog/{}</id>", HOST, post.slug));
        feed.push_str(&format!("\n    <updated>{}</updated>", post.date));
        feed.push_str(&format!(
            "\n    <summary>{}</summary>",
            html_escape(&post.excerpt)
        ));
        feed.push_str(&format!(
            "\n    <content type=\"html\">{}</content>",
            html_escape(&post.html)
        ));
        feed.push_str("\n  </entry>");
    }

    feed.push_str("\n</feed>");

    fs::write(dist_dir.join("feed.xml"), feed)?;
    println!("Generated feed.xml");

    Ok(())
}

fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

fn copy_static_files() -> Result<()> {
    let dist_dir = Path::new("dist");

    // Copy public
    let images_dir = Path::new("public");
    if images_dir.exists() {
        copy_dir_recursive(images_dir, &dist_dir)?;
        println!("Copied images");
    }

    // Copy posts images
    let images_dir = Path::new("../posts/images");
    if images_dir.exists() {
        let target = dist_dir.join("posts/images");
        copy_dir_recursive(images_dir, &target)?;
        println!("Copied images");
    }

    // Generate or copy CSS
    generate_css()?;

    Ok(())
}

fn generate_css() -> Result<()> {
    use std::process::Command;

    let tailwind_bin = Path::new("./tailwindcss");

    // Try to run Tailwind CSS build
    if tailwind_bin.exists() {
        println!("Building CSS with Tailwind CLI...");
        let output = Command::new(tailwind_bin)
            .args(&["-i", "styles.css", "-o", "dist/styles.css", "--minify"])
            .output();

        match output {
            Ok(result) if result.status.success() => {
                println!("Generated styles.css");
                return Ok(());
            }
            Ok(result) => {
                eprintln!(
                    "Tailwind build failed: {}",
                    String::from_utf8_lossy(&result.stderr)
                );
            }
            Err(e) => {
                eprintln!("Failed to run Tailwind: {}", e);
            }
        }
    }

    // Fallback: check if pre-built CSS exists and copy it
    let prebuilt_css = Path::new("dist/styles.css");
    if !prebuilt_css.exists() {
        eprintln!("WARNING: No styles.css found in dist/");
        eprintln!("Please run: ./tailwindcss -i styles.css -o dist/styles.css --minify");
        eprintln!("Or download Tailwind CLI first if you don't have it.");
    } else {
        println!("Using existing styles.css");
    }

    Ok(())
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<()> {
    if !dst.exists() {
        fs::create_dir_all(dst)?;
    }

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let path = entry.path();
        let file_name = path.file_name().context("Invalid filename")?;
        let target = dst.join(file_name);

        if path.is_dir() {
            copy_dir_recursive(&path, &target)?;
        } else if !path.is_symlink() {
            fs::copy(&path, &target)?;
        }
    }

    Ok(())
}

fn main() -> Result<()> {
    generate_site()
}
