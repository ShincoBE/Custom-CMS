import type { PageContent, GalleryImage } from './types';

// =================================================================================
// LOCAL CONTENT STORE
// This file acts as the single source of truth for all content on the website.
// To update text or images, you only need to edit this file.
// =================================================================================

export const pageContentData: PageContent = {
  _id: 'main-content',
  
  // --- Navigation ---
  navHome: 'Home',
  navServices: 'Diensten',
  navBeforeAfter: 'Voor & Na',
  navGallery: 'Galerij',
  navContact: 'Contact',
  
  // --- Header ---
  logo: { 
    alt: 'Andries Service+ Logo',
    url: 'https://i.postimg.cc/J0B72T7c/logo-trans.png'
  },
  companyName: 'Andries Service+',
  
  // --- Hero Section ---
  heroTitle: 'Andries Service+',
  heroTagline: 'Uw Tuin, Onze Zorg. Professioneel tuinonderhoud voor een onberispelijke buitenruimte.',
  heroButtonText: 'Vraag een Offerte Aan',
  heroImage: {
    alt: 'Een prachtig onderhouden tuin als achtergrond',
    url: 'https://i.postimg.cc/431ktwwb/Hero.jpg'
  },
  
  // --- Services Section ---
  servicesTitle: 'Onze Diensten',
  servicesSubtitle: 'Wij bieden een breed scala aan diensten om uw tuin en woning in topconditie te houden.',
  servicesList: [
    {
      _key: 'service_1',
      title: 'Tuinonderhoud',
      description: 'Periodiek onderhoud, snoeien, gazonverzorging en onkruidbestrijding voor een altijd verzorgde tuin.',
      customIcon: { url: 'https://i.postimg.cc/pT3Y3g04/icon-mower.png', alt: 'Grasmaaier icoon' }
    },
    {
      _key: 'service_2',
      title: 'Tuinaanleg',
      description: 'Van ontwerp tot realisatie. Wij leggen uw droomtuin aan, inclusief beplanting, terrassen en omheiningen.',
      customIcon: { url: 'https://i.postimg.cc/KYvYQd2T/icon-shovel.png', alt: 'Schep icoon' }
    },
    {
      _key: 'service_3',
      title: 'Schilderwerken',
      description: 'Professioneel schilderwerk voor binnen en buiten. Gevels, muren, deuren en ramen met een perfecte afwerking.',
      customIcon: { url: 'https://i.postimg.cc/50pCHcgn/icon-roller.png', alt: 'Verfroller icoon' }
    },
    {
      _key: 'service_4',
      title: 'Kleine klusjes',
      description: 'Diverse klussen in en rond het huis, van kleine reparaties tot montagewerkzaamheden.',
      customIcon: { url: 'https://i.postimg.cc/8zQ2WpHy/icon-hammer.png', alt: 'Hamer icoon' }
    }
  ],
  
  // --- Before & After Section ---
  beforeAfterTitle: 'Voor & Na',
  beforeAfterSubtitle: 'Zie het verschil dat professioneel onderhoud maakt.',
  beforeImage: {
    alt: 'Verwilderde tuin voor onderhoud',
    url: 'https://i.postimg.cc/k4WnJgRj/before.jpg'
  },
  afterImage: {
    alt: 'Zelfde tuin, netjes en verzorgd na onderhoud',
    url: 'https://i.postimg.cc/y86g3Y9W/after.jpg'
  },
  
  // --- CTA Gallery Section ---
  servicesCtaTitle: 'Bekijk Ons Werk',
  servicesCtaSubtitle: 'Een foto zegt meer dan duizend woorden. Ontdek onze projecten in de galerij.',
  servicesCtaButtonText: 'Open Galerij',
  
  // --- Gallery Section ---
  galleryTitle: 'Galerij',
  gallerySubtitle: 'Een selectie van onze voltooide projecten.',

  // --- Contact Section ---
  contactTitle: 'Neem Contact Op',
  contactSubtitle: 'Heeft u vragen of wilt u een vrijblijvende offerte? Wij staan voor u klaar.',
  contactInfoTitle: 'Contactgegevens',
  contactInfoText: 'U kunt ons bereiken via de onderstaande gegevens, of door het formulier in te vullen.',
  contactAddressTitle: 'Adres',
  contactAddress: 'Hazenstraat 65\n2500 Lier\nBelgië',
  contactEmailTitle: 'Email',
  contactEmail: 'info.andries.serviceplus@gmail.com',
  contactPhoneTitle: 'Telefoon',
  contactPhone: '+32 494 39 92 86',
  contactFormNameLabel: 'Naam',
  contactFormEmailLabel: 'Emailadres',
  contactFormMessageLabel: 'Uw bericht',
  contactFormSubmitButtonText: 'Verstuur Bericht',
  contactFormSuccessTitle: 'Bericht Verzonden!',
  contactFormSuccessText: 'Bedankt voor uw bericht. We nemen zo spoedielijk mogelijk contact met u op.',
  contactFormSuccessAgainButtonText: 'Nog een bericht sturen',

  // --- SEO & Social Media ---
  ogImage: { url: 'https://i.postimg.cc/431ktwwb/Hero.jpg' },

  // --- Footer ---
  facebookUrl: 'https://www.facebook.com/profile.php?id=100089851722822',
  footerCopyrightText: 'Andries Service+. Alle rechten voorbehouden.',
};

export const galleryImagesData: GalleryImage[] = [
  { _id: 'gal_1', image: { url: 'https://i.postimg.cc/Pq9B1W9T/gal-1.jpg', alt: 'Strak gemaaid gazon met bloemenperk' } },
  { _id: 'gal_2', image: { url: 'https://i.postimg.cc/tJnNfLzW/gal-2.jpg', alt: 'Nieuw aangelegd terras met moderne tegels' } },
  { _id: 'gal_3', image: { url: 'https://i.postimg.cc/KzCgXn6s/gal-3.jpg', alt: 'Perfect geschilderde witte gevel van een huis' } },
  { _id: 'gal_4', image: { url: 'https://i.postimg.cc/L6h53Gjv/gal-4.jpg', alt: 'Snoeiwerk aan een grote haag' } },
  { _id: 'gal_5', image: { url: 'https://i.postimg.cc/Y0xH4Rk4/gal-5.jpg', alt: 'Aanleg van een houten schutting' } },
  { _id: 'gal_6', image: { url: 'https://i.postimg.cc/T3s7Nn2S/gal-6.jpg', alt: 'Opgeruimde tuin na een grote onderhoudsbeurt' } },
  { _id: 'gal_7', image: { url: 'https://i.postimg.cc/vB2XWbY4/gal-7.jpg', alt: 'Details van een pas geschilderde deur en kozijn' } },
  { _id: 'gal_8', image: { url: 'https://i.postimg.cc/rwGyjD0B/gal-8.jpg', alt: 'Aangelegde oprit met klinkers' } },
];
