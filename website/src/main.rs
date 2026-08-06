use anyhow::{Context, Result};
use chrono::Datelike;
use gray_matter::Matter;
use gray_matter::engine::YAML;
use markdown::{CompileOptions, Options, ParseOptions, to_html_with_options};
use minijinja::{AutoEscape, Environment, context};
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeMap;
use std::fmt::Write as _;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::LazyLock;
use std::time::SystemTime;
use syntect::highlighting::{Color, Theme, ThemeSet};
use syntect::html::highlighted_html_for_string;
use syntect::parsing::SyntaxSet;

const HOST: &str = "https://www.fvoron.com";
const CONTACT_EMAIL: &str = "dev@fvoron.com";
const DEFAULT_TITLE: &str = "François Voron";
const DEFAULT_DESCRIPTION: &str = "I build high-quality softwares with the best technologies to achieve your business goals in a fast-changing environment. Free 30-minutes call to talk about your project.";
const DEFAULT_IMAGE_PATH: &str = "/meta-image.jpg";

static SYNTAX_SET: LazyLock<SyntaxSet> = LazyLock::new(SyntaxSet::load_defaults_newlines);
static HIGHLIGHT_THEME: LazyLock<Theme> = LazyLock::new(|| {
    let mut theme = ThemeSet::load_defaults().themes["base16-eighties.dark"].clone();
    theme.settings.background = Some(Color {
        r: 10,
        g: 10,
        b: 10,
        a: 255,
    });
    theme
});
static CODE_PATTERN: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"<pre><code(?:\s+class="language-([^"]+)")?>([\s\S]*?)</code></pre>"#)
        .expect("valid code block regex")
});
static HEADING_PATTERNS: LazyLock<[Regex; 6]> = LazyLock::new(|| {
    std::array::from_fn(|index| {
        let level = index + 1;
        Regex::new(&format!(r"<h{level}>(.*?)</h{level}>")).expect("valid heading regex")
    })
});
static HTML_TAG_PATTERN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"<[^>]+>").expect("valid HTML tag regex"));
static IMAGE_PATTERN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"<img\b[^>]*>").expect("valid image regex"));
static IFRAME_PATTERN: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"<iframe\b[^>]*>").expect("valid iframe regex"));

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
    html: String,
    headings: Vec<Heading>,
    has_mermaid: bool,
}

#[derive(Deserialize)]
struct PostFrontMatter {
    title: String,
    date: String,
    #[serde(default)]
    tags: Vec<String>,
    #[serde(default)]
    excerpt: String,
    #[serde(default)]
    thumbnail: String,
    canonical: Option<String>,
}

#[derive(Serialize)]
struct SitemapUrl {
    path: String,
    lastmod: String,
    changefreq: &'static str,
    priority: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Heading {
    text: String,
    level: usize,
    slug: String,
}

/// Apply syntax highlighting to code blocks in HTML
fn apply_syntax_highlighting(html: &str) -> Result<String> {
    let result = CODE_PATTERN.replace_all(html, |caps: &regex::Captures| {
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
        let syntax = SYNTAX_SET
            .find_syntax_by_extension(lang)
            .or_else(|| SYNTAX_SET.find_syntax_by_token(lang))
            .unwrap_or_else(|| SYNTAX_SET.find_syntax_plain_text());

        // Generate highlighted HTML
        highlighted_html_for_string(&decoded, &SYNTAX_SET, syntax, &HIGHLIGHT_THEME)
            .unwrap_or_else(|_| format!("<pre><code>{}</code></pre>", code))
    });

    Ok(result.to_string())
}

/// Slugify a string to make it URL-safe
fn slugify(text: &str) -> String {
    let mut slug = String::with_capacity(text.len());
    let mut needs_separator = false;

    for character in text.chars().flat_map(char::to_lowercase) {
        if character.is_alphanumeric() {
            if needs_separator && !slug.is_empty() {
                slug.push('-');
            }
            slug.push(character);
            needs_separator = false;
        } else {
            needs_separator = true;
        }
    }

    slug
}

/// Extract headings from HTML and add IDs (preserving document order)
fn process_headings(html: &str) -> (String, Vec<Heading>) {
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
    for (index, heading_pattern) in HEADING_PATTERNS.iter().enumerate() {
        let level = index + 1;
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

    let headings: Vec<Heading> = matches
        .iter()
        .map(|heading_match| {
            let plain_text = HTML_TAG_PATTERN.replace_all(&heading_match.text, "");
            Heading {
                text: plain_text.to_string(),
                level: heading_match.level,
                slug: format!("header-{}", slugify(&plain_text)),
            }
        })
        .collect();

    // Process headings from end to start to preserve byte offsets.
    for (heading_match, heading) in matches.iter().zip(&headings).rev() {
        let replacement = format!(
            "<h{} id=\"{}\">{}</h{}>",
            heading_match.level, heading.slug, heading_match.text, heading_match.level
        );

        result.replace_range(heading_match.start..heading_match.end, &replacement);
    }

    (result, headings)
}

fn optimize_embedded_media(html: &str) -> String {
    let html = IMAGE_PATTERN.replace_all(html, |caps: &regex::Captures| {
        let tag = caps.get(0).expect("image match").as_str();
        let mut attributes = String::new();
        if !tag.contains(" loading=") {
            attributes.push_str(" loading=\"lazy\"");
        }
        if !tag.contains(" decoding=") {
            attributes.push_str(" decoding=\"async\"");
        }
        format!("<img{attributes}{}", &tag[4..])
    });

    IFRAME_PATTERN
        .replace_all(&html, |caps: &regex::Captures| {
            let tag = caps.get(0).expect("iframe match").as_str();
            if tag.contains(" loading=") {
                tag.to_string()
            } else {
                format!("<iframe loading=\"lazy\"{}", &tag[7..])
            }
        })
        .into_owned()
}

fn parse_blog_post(path: &Path) -> Result<BlogPost> {
    let content = fs::read_to_string(path)?;
    let matter = Matter::<YAML>::new();
    let result = matter.parse(&content);

    let data: PostFrontMatter = result
        .data
        .ok_or_else(|| anyhow::anyhow!("Missing frontmatter"))?
        .deserialize()?;
    let PostFrontMatter {
        title,
        date,
        tags,
        excerpt,
        thumbnail,
        canonical,
    } = data;

    // Format the date for display (ISO format YYYY-MM-DD)
    let formatted_date = if let Ok(parsed_datetime) = chrono::DateTime::parse_from_rfc3339(&date) {
        parsed_datetime.format("%Y-%m-%d").to_string()
    } else if let Ok(parsed_date) = chrono::NaiveDate::parse_from_str(&date, "%Y-%m-%d") {
        parsed_date.format("%Y-%m-%d").to_string()
    } else {
        date.clone()
    };

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
    let has_mermaid = html.contains("<pre class=\"mermaid\">");

    // Extract headings and add IDs
    let (html, headings) = process_headings(&html);
    let html = optimize_embedded_media(&html);

    Ok(BlogPost {
        title,
        slug,
        date,
        formatted_date,
        tags,
        excerpt,
        thumbnail,
        canonical,
        html,
        headings,
        has_mermaid,
    })
}

fn get_all_posts() -> Result<Vec<BlogPost>> {
    let posts_dir = Path::new("../posts");
    let mut paths: Vec<PathBuf> = fs::read_dir(posts_dir)?
        .map(|entry| entry.map(|entry| entry.path()))
        .collect::<std::io::Result<_>>()?;
    paths.retain(|path| path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("md"));
    paths.sort();

    let mut posts: Vec<BlogPost> = paths
        .iter()
        .map(|path| {
            parse_blog_post(path)
                .with_context(|| format!("Failed to parse blog post {}", path.display()))
        })
        .collect::<Result<_>>()?;

    // Sort by date, newest first
    posts.sort_by(|a, b| b.date.cmp(&a.date));

    Ok(posts)
}

fn get_all_tags(posts: &[BlogPost]) -> BTreeMap<String, String> {
    let mut tags = BTreeMap::new();
    for post in posts {
        for tag in &post.tags {
            let normalized = normalize_tag(tag);
            tags.insert(normalized, tag.clone());
        }
    }
    tags
}

fn get_posts_by_tag(posts: &[BlogPost]) -> BTreeMap<String, Vec<&BlogPost>> {
    let mut posts_by_tag = BTreeMap::new();
    for post in posts {
        for tag in &post.tags {
            posts_by_tag
                .entry(normalize_tag(tag))
                .or_insert_with(Vec::new)
                .push(post);
        }
    }
    posts_by_tag
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
    let resolved_image = Some(match image {
        Some(image) if image.starts_with("http://") || image.starts_with("https://") => {
            image.to_string()
        }
        Some(image) => format!("{HOST}/{}", image.trim_start_matches('/')),
        None => format!("{HOST}{DEFAULT_IMAGE_PATH}"),
    });
    let resolved_canonical = Some(
        canonical
            .map(str::to_string)
            .unwrap_or_else(|| format!("{HOST}/{}", url.trim_start_matches('/'))),
    );

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
    env.set_auto_escape_callback(|_| AutoEscape::Html);

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
            let ext = path.extension().and_then(|s| s.to_str());
            if ext == Some("html") || ext == Some("xml") {
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
    let posts_by_tag = get_posts_by_tag(&posts);

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
        let meta = build_meta(
            Some(&format!("{} - François Voron", post.title)),
            Some(&post.excerpt),
            (!post.thumbnail.is_empty()).then_some(post.thumbnail.as_str()),
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
        let tag_posts = posts_by_tag
            .get(normalized_tag)
            .context("Missing posts for known tag")?;

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
            posts => &tag_posts,
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

    let meta = build_meta(
        Some(&format!("{} - Open Source", DEFAULT_TITLE)),
        Some("Open-source projects I maintain and contribute to"),
        None,
        "/open-source",
        None,
    );
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

    // Generate Bookinou Geek page
    let bookinou_dir = dist_dir.join("bookinou-geek");
    fs::create_dir_all(&bookinou_dir)?;

    // Copy bookinou-geek assets
    let bookinou_assets_dir = Path::new("../bookinou-geek/assets");
    if bookinou_assets_dir.exists() {
        copy_dir_recursive(bookinou_assets_dir, &bookinou_dir)?;
        println!("Copied bookinou-geek assets");
    }

    // Parse the bookinou-geek markdown file
    let bookinou_content = fs::read_to_string("../bookinou-geek/content.md")
        .context("Failed to read bookinou-geek/content.md")?;

    let matter = Matter::<YAML>::new();
    let result = matter.parse(&bookinou_content);

    let data: Value = result
        .data
        .ok_or_else(|| anyhow::anyhow!("Missing frontmatter in bookinou-geek.md"))?
        .deserialize()?;

    let title = data["title"]
        .as_str()
        .unwrap_or("Bookinou Geek")
        .to_string();
    let description = data["description"]
        .as_str()
        .unwrap_or("Astuces techniques pour Bookinou")
        .to_string();

    let mut html = to_html_with_options(
        &result.content,
        &Options {
            parse: ParseOptions::default(),
            compile: CompileOptions {
                allow_dangerous_html: true,
                allow_dangerous_protocol: true,
                ..CompileOptions::default()
            },
        },
    )
    .map_err(|e| anyhow::anyhow!("Failed to convert bookinou-geek.md to HTML: {:?}", e))?;

    // Create a function to add anchor IDs and links to headings properly
    fn add_anchor_ids(html: &str) -> String {
        use regex::Regex;
        use slug::slugify;

        let re_h1 = Regex::new(r#"<h1>(.*?)</h1>"#).unwrap();
        let re_h2 = Regex::new(r#"<h2>(.*?)</h2>"#).unwrap();
        let re_h3 = Regex::new(r#"<h3>(.*?)</h3>"#).unwrap();

        let html = re_h1.replace_all(html, |caps: &regex::Captures| {
            let content = &caps[1];
            let id = slugify(content);
            format!("<h1 id=\"{}\">{}<a href=\"#{}\" class=\"anchor-link\" aria-hidden=\"true\">#</a></h1>", id, content, id)
        }).to_string();

        let html = re_h2.replace_all(&html, |caps: &regex::Captures| {
            let content = &caps[1];
            let id = slugify(content);
            format!("<h2 id=\"{}\">{}<a href=\"#{}\" class=\"anchor-link\" aria-hidden=\"true\">#</a></h2>", id, content, id)
        }).to_string();

        re_h3.replace_all(&html, |caps: &regex::Captures| {
            let content = &caps[1];
            let id = slugify(content);
            format!("<h3 id=\"{}\">{}<a href=\"#{}\" class=\"anchor-link\" aria-hidden=\"true\">#</a></h3>", id, content, id)
        }).to_string()
    }

    html = optimize_embedded_media(&add_anchor_ids(&html));

    let template = env
        .get_template("bookinou-geek")
        .context("Failed to load bookinou-geek template")?;

    let rendered = template.render(context! {
        host => HOST,
        title => title,
        description => description,
        content => html,
    })?;

    fs::write(bookinou_dir.join("index.html"), rendered)?;
    println!("Generated bookinou-geek/index.html");

    // Generate Atom feed
    generate_atom_feed(&posts, dist_dir)?;

    // Generate sitemap
    generate_sitemap(&posts, &tags, dist_dir, &env)?;

    // Copy static files
    copy_static_files(dist_dir)?;

    println!("Site generation complete!");

    Ok(())
}

fn generate_atom_feed(posts: &[BlogPost], dist_dir: &Path) -> Result<()> {
    let content_size: usize = posts.iter().map(|post| post.html.len()).sum();
    let mut feed = String::with_capacity(content_size + posts.len() * 512 + 1024);
    feed.push_str(
        r#"<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">"#,
    );

    feed.push_str("\n  <title>François Voron</title>");
    feed.push_str("\n  <subtitle>Experiments, thoughts and stories about my work</subtitle>");
    write!(feed, "\n  <link rel=\"self\" href=\"{HOST}/feed.xml\" />")?;

    if let Some(first_post) = posts.first() {
        write!(feed, "\n  <updated>{}</updated>", first_post.date)?;
    }

    feed.push_str("\n  <author>");
    feed.push_str("\n    <name>François Voron</name>");
    write!(feed, "\n    <email>{CONTACT_EMAIL}</email>")?;
    feed.push_str("\n  </author>");
    write!(feed, "\n  <id>{HOST}/blog</id>")?;

    for post in posts {
        feed.push_str("\n  <entry>");
        write!(feed, "\n    <title>{}</title>", html_escape(&post.title))?;
        write!(feed, "\n    <link href=\"{HOST}/blog/{}\" />", post.slug)?;
        write!(feed, "\n    <id>{HOST}/blog/{}</id>", post.slug)?;
        write!(feed, "\n    <updated>{}</updated>", post.date)?;
        write!(
            feed,
            "\n    <summary>{}</summary>",
            html_escape(&post.excerpt)
        )?;
        write!(
            feed,
            "\n    <content type=\"html\">{}</content>",
            html_escape(&post.html)
        )?;
        feed.push_str("\n  </entry>");
    }

    feed.push_str("\n</feed>");

    fs::write(dist_dir.join("feed.xml"), feed)?;
    println!("Generated feed.xml");

    Ok(())
}

fn generate_sitemap(
    posts: &[BlogPost],
    tags: &BTreeMap<String, String>,
    dist_dir: &Path,
    env: &Environment<'static>,
) -> Result<()> {
    let mut urls = Vec::new();
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();

    // Homepage
    urls.push(SitemapUrl {
        path: "/".to_string(),
        lastmod: today.clone(),
        changefreq: "weekly",
        priority: 1.0,
    });

    urls.push(SitemapUrl {
        path: "/blog/".to_string(),
        lastmod: posts
            .first()
            .map(|post| post.formatted_date.clone())
            .unwrap_or_else(|| today.clone()),
        changefreq: "weekly",
        priority: 0.9,
    });

    // Blog posts
    for post in posts {
        urls.push(SitemapUrl {
            path: format!("/blog/{}", post.slug),
            lastmod: post.formatted_date.clone(),
            changefreq: "monthly",
            priority: 0.8,
        });
    }

    for normalized_tag in tags.keys() {
        urls.push(SitemapUrl {
            path: format!("/blog/tag/{normalized_tag}/"),
            lastmod: posts
                .first()
                .map(|post| post.formatted_date.clone())
                .unwrap_or_else(|| today.clone()),
            changefreq: "monthly",
            priority: 0.6,
        });
    }

    // Special pages
    urls.push(SitemapUrl {
        path: "/bookinou-geek/".to_string(),
        lastmod: today.clone(),
        changefreq: "monthly",
        priority: 0.9,
    });

    urls.push(SitemapUrl {
        path: "/open-source/".to_string(),
        lastmod: today.clone(),
        changefreq: "monthly",
        priority: 0.7,
    });

    urls.push(SitemapUrl {
        path: "/terms/".to_string(),
        lastmod: today,
        changefreq: "yearly",
        priority: 0.2,
    });

    // Render template
    let template = env.get_template("sitemap")?;
    let rendered = template.render(context! {
        host => HOST,
        urls => &urls,
    })?;

    fs::write(dist_dir.join("sitemap.xml"), rendered)?;
    println!("Generated sitemap.xml");

    Ok(())
}

fn html_escape(s: &str) -> String {
    let mut escaped = String::with_capacity(s.len());
    for character in s.chars() {
        match character {
            '&' => escaped.push_str("&amp;"),
            '<' => escaped.push_str("&lt;"),
            '>' => escaped.push_str("&gt;"),
            '"' => escaped.push_str("&quot;"),
            '\'' => escaped.push_str("&#39;"),
            _ => escaped.push(character),
        }
    }
    escaped
}

fn copy_static_files(dist_dir: &Path) -> Result<()> {
    // Copy public
    let images_dir = Path::new("public");
    if images_dir.exists() {
        copy_dir_recursive(images_dir, dist_dir)?;
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
    generate_css(dist_dir)?;

    Ok(())
}

fn generate_css(dist_dir: &Path) -> Result<()> {
    use std::process::Command;

    let tailwind_bin = Path::new("./tailwindcss");
    let cached_css = Path::new("target/site-cache/styles.css");
    let cache_stamp = Path::new("target/site-cache/styles.stamp");
    let mut css_inputs = vec![
        Path::new("styles.css"),
        Path::new("templates"),
        Path::new("package.json"),
        Path::new("../posts"),
        Path::new("../bookinou-geek"),
    ];
    if tailwind_bin.exists() {
        css_inputs.push(tailwind_bin);
    }
    let cache_is_fresh = cached_css.exists()
        && cache_stamp.exists()
        && !css_inputs
            .iter()
            .any(|input| path_is_newer(input, cache_stamp).unwrap_or(true));

    if !cache_is_fresh {
        if !tailwind_bin.exists() {
            anyhow::bail!(
                "CSS inputs changed, but the Tailwind CLI is unavailable. Run `just install` and retry"
            );
        }

        println!("Building CSS with Tailwind CLI...");
        fs::create_dir_all(cached_css.parent().context("Invalid CSS cache path")?)?;
        let output = Command::new(tailwind_bin)
            .args(["-i", "styles.css", "-o"])
            .arg(cached_css)
            .arg("--minify")
            .output()
            .context("Failed to run Tailwind")?;
        if !output.status.success() {
            anyhow::bail!(
                "Tailwind build failed: {}",
                String::from_utf8_lossy(&output.stderr)
            );
        }
        fs::write(cache_stamp, [])?;
        println!("Generated styles.css");
    }

    if !cached_css.exists() {
        anyhow::bail!(
            "CSS could not be generated. Install the Tailwind CLI with `just install` and retry"
        );
    }

    fs::copy(cached_css, dist_dir.join("styles.css"))?;
    if cache_is_fresh {
        println!("Reused cached styles.css");
    } else {
        println!("Copied generated styles.css");
    }

    Ok(())
}

fn path_is_newer(path: &Path, reference: &Path) -> Result<bool> {
    let reference_modified = reference.metadata()?.modified()?;
    newest_modified(path).map(|modified| modified > reference_modified)
}

fn newest_modified(path: &Path) -> Result<SystemTime> {
    let metadata = fs::symlink_metadata(path)?;
    let mut newest = metadata.modified()?;
    if metadata.is_dir() {
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let candidate = newest_modified(&entry.path())?;
            newest = newest.max(candidate);
        }
    }
    Ok(newest)
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<()> {
    if !dst.exists() {
        fs::create_dir_all(dst)?;
    }

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let path = entry.path();
        let file_name = path.file_name().context("Invalid filename")?;
        if file_name.to_string_lossy().starts_with('.') {
            continue;
        }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn slugify_collapses_separators() {
        assert_eq!(slugify("Hello,   Rust -- world!"), "hello-rust-world");
    }

    #[test]
    fn headings_keep_document_order_and_receive_ids() {
        let (html, headings) = process_headings("<h2>First <em>heading</em></h2><h3>Next</h3>");

        assert_eq!(headings.len(), 2);
        assert_eq!(headings[0].text, "First heading");
        assert_eq!(headings[0].slug, "header-first-heading");
        assert_eq!(headings[1].slug, "header-next");
        assert!(html.contains("<h2 id=\"header-first-heading\">"));
        assert!(html.contains("<h3 id=\"header-next\">"));
    }

    #[test]
    fn embedded_media_is_lazy_without_duplicate_attributes() {
        let html = optimize_embedded_media(
            r#"<img src="image.png"><img loading="eager" decoding="sync" src="hero.png"><iframe src="video"></iframe>"#,
        );

        assert!(html.contains(r#"<img loading="lazy" decoding="async" src="image.png">"#));
        assert!(html.contains(r#"<img loading="eager" decoding="sync" src="hero.png">"#));
        assert!(html.contains(r#"<iframe loading="lazy" src="video">"#));
    }

    #[test]
    fn html_escape_uses_a_single_correct_pass() {
        assert_eq!(html_escape("<&\"'>"), "&lt;&amp;&quot;&#39;&gt;");
    }
}
