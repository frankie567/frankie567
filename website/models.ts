export interface BlogPost {
    title: string;
    slug: string;
    date: string;
    tags: string[];
    canonical?: string;
    excerpt: string;
    thumbnail: string;
    content: string;
}
