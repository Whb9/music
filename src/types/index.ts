// src/types/index.ts

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface SiteFooter {
  links: FooterLink[];
  address: string;
  phone: string;
  postcode: string;
  wechat: string;
  email: string;
}

export interface SiteInfo {
  schoolName: string;
  collegeName: string;
  title: string;
  logo: string;
  campusImage: string;
  schoolUrl: string;
  nav: NavItem[];
  footer: SiteFooter;
}

export interface Teacher {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rank: string;
  department: string;
  bio: string;
  contact: string;
}

export interface Chapter {
  id: string;
  title: string;
  requirements: string;
  background: string;
  appreciation: string;
  practice: string;
  images: string[];
  videos: string[];
}

export interface Course {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  teacherId: string;
  coverImage: string;
  description: string;
  objectives: string;
  keyPoints: string;
  difficulties: string;
  chapters: Chapter[];
}

export interface SiteData {
  site: SiteInfo;
  teachers: Teacher[];
  courses: Course[];
}

export type CourseSection =
  | 'intro'
  | 'requirements'
  | 'background'
  | 'appreciation'
  | 'practice';
