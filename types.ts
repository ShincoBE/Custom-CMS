// Simplified image type, no longer tied to Sanity's structure.
export interface AppImage {
  alt?: string;
  url: string;
}

// The definitive, simplified interface for a Service
export interface Service {
  _key: string;
  title: string;
  description: string;
  customIcon?: AppImage; // The custom uploaded image (now optional)
  published?: boolean; // New: To control visibility on the live site
  hasPage?: boolean; // New: Toggle for dedicated service page
  slug?: string; // New: URL slug for the dedicated page
  pageContent?: string; // New: Markdown/HTML content for the page
}

export interface PageContent {
  _id: string;
  
  // Navigation
  navHome?: string;
  navServices?: string;
  navBeforeAfter?: string;
  navGallery?: string;
  navContact?: string;
  
  // Header
  logo?: AppImage;
  companyName?: string;
  
  // Hero Section
  heroTitle?: string;
  heroTagline?: string;
  heroButtonText?: string;
  heroImage?: AppImage;
  
  // Services Section
  servicesTitle?: string;
  servicesSubtitle?: string;
  servicesList?: Service[];
  
  // Before & After Section
  beforeAfterTitle?: string;
  beforeAfterSubtitle?: string;
  beforeImage?: AppImage;
  afterImage?: AppImage;
  
  // CTA Gallery Section
  servicesCtaTitle?: string;
  servicesCtaSubtitle?: string;
  servicesCtaButtonText?: string;
  
  // Gallery
  galleryTitle?: string;
  gallerySubtitle?: string;

  // Contact Section
  contactTitle?: string;
  contactSubtitle?: string;
  contactInfoTitle?: string;
  contactInfoText?: string;
  contactAddressTitle?: string;
  contactAddress?: string;
  contactEmailTitle?: string;
  contactEmail?: string;
  contactPhoneTitle?: string;
  contactPhone?: string;
  contactFormNameLabel?: string;
  contactFormEmailLabel?: string;
  contactFormMessageLabel?: string;
  contactFormSubmitButtonText?: string;
  contactFormSuccessTitle?: string;
  contactFormSuccessText?: string;
  contactFormSuccessAgainButtonText?: string;
  contactMapEnabled?: boolean; 
  contactMapUrl?: string; 

  // SEO & Social Media
  ogImage?: AppImage;

  // Footer
  facebookUrl?: string;
  footerCopyrightText?: string;
}

export interface GalleryImage {
  _id: string;
  image: AppImage;
  published?: boolean; 
  category?: string; 
}

export type UserRole = 'SuperAdmin' | 'Admin' | 'Editor';

export interface User {
  username: string;
  role: UserRole;
  hashedPassword?: string; 
}

// Analytics Types
export interface DailyAnalytics {
  total: number;
  pages: Record<string, number>;
  referrers: Record<string, number>;
}

export interface AnalyticsData {
  total: number;
  topReferrer: string;
  daily: { date: string; visits: number }[];
  pages: { path: string; visits: number }[];
  referrers: { source: string; visits: number }[];
}

// Site-wide settings
export interface SiteSettings {
    emailUser?: string;
    emailPass?: string;
    emailTo?: string;
    maintenanceMode?: boolean;
    analyticsUrl?: string;
}

// Activity Log Type
export interface ActivityLogEntry {
    _id: string;
    timestamp: string;
    username: string;
    action: string;
}