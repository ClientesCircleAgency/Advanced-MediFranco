export interface BlogPost {
    id: string;
    title: string;
    subtitle: string | null;
    content: string;
    author: string;
    images: string[];
    slug: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

export type BlogPostInput = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;
