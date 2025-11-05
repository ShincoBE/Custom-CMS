import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Based on Sanity image asset structure
// Fix: An interface cannot extend a union type. This interface defines a specific object
// structure that is compatible with `SanityImageSource`, so the `extends` clause is removed.
export interface SanityImage {
  alt?: string;
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

// The definitive, simplified interface for a Service
export interface Service {
  _key: string;
  title: string;
  description: string;
  customIcon?: SanityImage; // The custom uploaded image (now optional)
}

export interface PageContent {
  _id: string;
  _type: 'pageContent';
  
  // Navigation
  navHome?: string;
  navServices?: string;
  navBeforeAfter?: string;
  navGallery?: string;
  navContact?: string;
  
  // Header
  logo?: SanityImage;
  companyName?: string;
  
  // Hero Section
  heroTitle?: string;
  heroTagline?: string;
  heroButtonText?: string;
  heroImage?: SanityImage;
  
  // Services Section
  servicesTitle?: string;
  servicesSubtitle?: string;
  servicesList?: Service[]; // Uses the new, simplified Service interface
  
  // Before & After Section
  beforeAfterTitle?: string;
  beforeAfterSubtitle?: string;
  beforeImage?: SanityImage;
  afterImage?: SanityImage;
  
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
  ogImage?: SanityImage;

  // Footer
  facebookUrl?: string;
  footerCopyrightText?: string;
}

export interface GalleryImage {
  _id: string;
  image: SanityImage;
}