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

export interface Testimonial {
  _key: string;
  quote: string;
  name: string;
  rating: number; // 1 to 5
  published?: boolean;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  mainImage?: AppImage;
  content: string;
  published?: boolean;
  publishedAt: string;
}


export interface PageContent {
  _id: string;
  
  // Navigation
  navHome?: string;
  navServices?: string;
  navBeforeAfter?: string;
  navGallery?: string;
  navContact?: string;
  navBlog?: string; // New: for blog link
  
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
  
  // Testimonials Section
  testimonialsTitle?: string;
  testimonialsSubtitle?: string;
  testimonials?: Testimonial[];
  
  // Blog Section
  blogTitle?: string;
  blogSubtitle?: string;
  
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
  contactQuoteCardTitle?: string;
  contactQuoteCardText?: string;
  contactQuoteCardButtonText?: string;
  contactDirectCardTitle?: string;
  contactDirectCardText?: string;
  contactAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactMapEnabled?: boolean; 
  contactMapUrl?: string; 

  // New: Quote Form Email Templates
  quoteAdminEmailSubject?: string;
  quoteAdminEmailBody?: string;
  quoteUserEmailSubject?: string;
  quoteUserEmailBody?: string;
  

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
  uniques: number;
  topReferrer: string;
  topCity: string;
  daily: { date: string; visits: number; uniques: number }[];
  pages: { path: string; visits: number }[];
  referrers: { source: string; visits: number }[];
  devices: { type: string; visits: number }[];
  locations: { country: string; city: string; visits: number }[];
  events: { name: string; detail: string; count: number }[];
}

export interface MediaItem {
    url: string;
    pathname: string;
    size: number;
    uploadedAt: string;
}

// Site-wide settings
export interface SiteSettings {
    emailUser?: string;
    emailPass?: string;
    emailTo?: string;
    maintenanceMode?: boolean;
    analyticsUrl?: string;
    showTestimonials?: boolean;
    showBlog?: boolean;
    enablePublicReviews?: boolean;
}

// Activity Log Type
export interface ActivityLogEntry {
    _id: string;
    timestamp: string;
    username: string;
    action: string;
}