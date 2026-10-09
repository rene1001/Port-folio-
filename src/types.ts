export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  problem?: string;
  solution?: string;
  mainImage: string;
  gallery: string[];
  category: string;
  technologies: string[];
  features: string[];
  year: string;
  client?: string;
  role?: string;
  url?: string;
  github?: string;
  status: 'published' | 'draft';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  mainImage: string;
  ogImage?: string;
  category: string;
  tags: string[];
  author: string;
  readingTime: string;
  status: 'published' | 'draft';
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  icon?: string;
  level: number; // 0 to 100
  order: number;
  status: 'active' | 'inactive';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  availableForWork: boolean;
  avatarUrl: string;
  resumeUrl: string;
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    website: string;
  };
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'resolved';
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  gaMeasurementId: string;
  maintenanceMode: boolean;
  primaryLanguage: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalMessages: number;
  unreadMessages: number;
  totalSkills: number;
  totalServices: number;
  recentActivities: Array<{
    id: string;
    type: 'project_created' | 'project_updated' | 'post_created' | 'post_published' | 'message_received';
    title: string;
    timestamp: string;
  }>;
}
