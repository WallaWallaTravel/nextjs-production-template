/**
 * SEO Utilities
 *
 * Helpers for generating consistent metadata across pages.
 */

import { Metadata } from 'next';

// ============================================================================
// Configuration
// ============================================================================

const SITE_NAME = 'My App'; // TODO: Update with your app name
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
const DEFAULT_DESCRIPTION = 'Description of your application'; // TODO: Update

// ============================================================================
// Metadata Helpers
// ============================================================================

export interface PageMetadata {
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}

/**
 * Generate metadata for a page
 */
export function generateMetadata(options: PageMetadata): Metadata {
  const title = options.title === SITE_NAME
    ? SITE_NAME
    : `${options.title} | ${SITE_NAME}`;

  const description = options.description || DEFAULT_DESCRIPTION;
  const image = options.image || `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    keywords: options.keywords,
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: options.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * Generate JSON-LD structured data
 */
export function generateJsonLd(
  type: 'Organization' | 'WebSite' | 'Article',
  data: Record<string, unknown>
): string {
  const baseContext = { '@context': 'https://schema.org', '@type': type };
  return JSON.stringify({ ...baseContext, ...data });
}

/**
 * Organization JSON-LD
 */
export function organizationJsonLd(options: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}): string {
  return generateJsonLd('Organization', {
    name: options.name,
    url: options.url,
    logo: options.logo,
    description: options.description,
  });
}

/**
 * WebSite JSON-LD
 */
export function websiteJsonLd(options: {
  name: string;
  url: string;
  description?: string;
}): string {
  return generateJsonLd('WebSite', {
    name: options.name,
    url: options.url,
    description: options.description,
  });
}
