import React from 'react';
import { PageContent, Service, BlogPost } from '@/types';

interface StructuredDataProps {
  pageContent?: PageContent | null;
  service?: Service | null;
  blogPost?: BlogPost | null;
  faqs?: { question: string; answer: string }[];
}

const StructuredData = ({ pageContent, service, blogPost, faqs }: StructuredDataProps) => {
  try {
    const websiteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.andriesserviceplus.be';

    let addressSchema;
    let localBusinessSchema: any = null;

    if (pageContent) {
      const {
        companyName,
        logo,
        contactAddress,
        contactEmail,
        contactPhone,
        servicesList,
        facebookUrl
      } = pageContent;

      if (contactAddress) {
        const lines = contactAddress.split('\n');
        const street = lines[0];
        const cityLine = lines[1] || ''; // Use empty string as fallback
        const cityParts = cityLine.trim().split(' ');
        const postalCode = cityParts[0];
        const addressLocality = cityParts.slice(1).join(' ');

        if (street && postalCode && addressLocality) {
          addressSchema = {
            '@type': 'PostalAddress',
            streetAddress: street,
            addressLocality: addressLocality,
            postalCode: postalCode,
            addressCountry: 'BE',
          };
        }
      }

      // Base Schema for Local Business
      localBusinessSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: companyName,
        image: logo?.url,
        '@id': websiteUrl,
        url: websiteUrl,
        telephone: contactPhone,
        email: contactEmail,
        address: addressSchema,
        sameAs: facebookUrl ? [facebookUrl] : undefined,
        priceRange: '€€',
        openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "08:00",
              "closes": "18:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Saturday",
              "opens": "09:00",
              "closes": "13:00"
            }
        ],
         // Defensive check for servicesList
        hasOffer: Array.isArray(servicesList) ? servicesList
          .filter(s => s && s.published) // check if 's' is not null/undefined
          .map(s => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: s.title,
              description: s.description,
              url: s.hasPage && s.slug ? `${websiteUrl}/diensten/${s.slug}` : undefined,
            },
          })) : undefined,
      };
    }

    let pageSchema: any = null;

    // Schema for a specific service page
    if (service && pageContent) {
      pageSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.title,
        description: service.description,
        serviceType: service.title,
        provider: {
          '@type': 'LocalBusiness',
          name: pageContent.companyName,
        },
        image: service.customIcon?.url,
      };
    }

    // Schema for a specific blog post page
    if (blogPost && pageContent) {
      pageSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${websiteUrl}/blog/${blogPost.slug}`,
        },
        headline: blogPost.title,
        description: blogPost.excerpt,
        image: blogPost.mainImage?.url,
        author: {
          '@type': 'Organization',
          name: pageContent.companyName,
        },
        publisher: {
          '@type': 'Organization',
          name: pageContent.companyName,
          logo: {
            '@type': 'ImageObject',
            url: pageContent.logo?.url,
          },
        },
        datePublished: blogPost.publishedAt,
      };
    }
    
    // Breadcrumb Schema for subpages
    let breadcrumbSchema = null;
    if(service || blogPost) {
        const breadcrumbList = [
          { '@type': 'ListItem', position: 1, name: 'Home', item: websiteUrl },
        ];
        if (service) {
          breadcrumbList.push({ '@type': 'ListItem', position: 2, name: service.title, item: `${websiteUrl}/diensten/${service.slug}` });
        }
        if (blogPost) {
          breadcrumbList.push({ '@type': 'ListItem', position: 2, name: 'Blog', item: `${websiteUrl}/blog` });
          breadcrumbList.push({ '@type': 'ListItem', position: 3, name: blogPost.title, item: `${websiteUrl}/blog/${blogPost.slug}` });
        }
        breadcrumbSchema = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbList,
        };
    }

    let faqSchema = null;
    if (faqs && faqs.length > 0) {
      faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
    }

    const schemas = [localBusinessSchema, pageSchema, breadcrumbSchema, faqSchema].filter(Boolean);

    if (schemas.length === 0) {
        return null;
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas.length > 1 ? schemas : schemas[0]),
        }}
      />
    );
  } catch (error) {
    console.error("Error generating structured data. This will not crash the site.", error);
    return null; // Return null to prevent crashing the page
  }
};

export default StructuredData;
