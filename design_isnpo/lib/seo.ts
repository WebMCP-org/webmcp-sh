import config from "@/config";
import { Metadata } from "next";

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrlRelative?: string;
  keywords?: string[];
}

export function getSEOTags({
  title,
  description,
  canonicalUrlRelative,
  keywords = [],
}: SEOProps = {}): Metadata {
  const seoTitle = title || config.websiteName;
  const seoDescription = description || config.websiteDescription;
  const canonicalUrl = `${config.websiteUrl}${canonicalUrlRelative || ""}`;

  const metadata: Metadata = {
    title: seoTitle,
    description: seoDescription,
    keywords,
    metadataBase: new URL(config.websiteUrl),
    alternates: {
      canonical: canonicalUrlRelative,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      siteName: config.websiteName,
      locale: "en_US",
      type: "website",
      images: [{ url: config.websiteUrl + "/banner.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [{ url: config.websiteUrl + "/banner.png" }],
    },
  };

  return metadata;
}

export function generateSchemaObject() {
  const { websiteName, websiteUrl } = config;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: websiteName,
    description: config.websiteDescription,
    url: websiteUrl,
    image: config.websiteUrl + "/banner.png",
    sameAs: [],
  };
}

export function getArticleSEOTags({
  title,
  description,
  canonicalUrlRelative,
  publishedTime,
  authors = [],
  tags = [],
  image,
}: SEOProps & {
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
  image?: string;
} = {}): Metadata {
  const baseTags = getSEOTags({
    title,
    description,
    canonicalUrlRelative,
  });

  return {
    ...baseTags,
    openGraph: {
      ...baseTags.openGraph,
      type: "article",
      publishedTime,
      authors,
      tags,
      images: image
        ? [{ url: image }]
        : [{ url: config.websiteUrl + "/banner.png" }],
    },
  };
}
