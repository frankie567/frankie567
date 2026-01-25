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

export interface Reference {
  title: string;
  slug: string;
  client: string;
  year: number;
  technologies: string[];
  excerpt: string;
  thumbnail: string;
  content: string;
}

export enum AnalyticsEvent {
  CALENDLY_OPENED = 'Calendly Opened',
  CALENDLY_BOOKED = 'Calendly Booked',
}
