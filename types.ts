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

  // SEO & Social Media
  ogImage?: AppImage;

  // Footer
  facebookUrl?: string;
  footerCopyrightText?: string;
}

export interface GalleryImage {
  _id: string;
  image: AppImage;
}