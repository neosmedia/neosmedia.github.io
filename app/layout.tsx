import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Gochi_Hand } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import {
  DRIBBBLE_URL, EMAIL, KEYWORDS, LINKEDIN_URL, NAME, ROLE_TITLE, SITE_DESCRIPTION, SITE_TAGLINE, SITE_URL, X_URL,
} from "@/lib/site";

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Gochi_Hand({ subsets: ["latin"], weight: "400", variable: "--font-serif", display: "swap" });

const TITLE = `${NAME} | ${SITE_TAGLINE}`;
const OG_ALT = "TYLER LANGE in chunky balloon letters";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s | ${NAME}` },
  description: SITE_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: NAME,
  authors: [{ name: NAME, url: SITE_URL }],
  creator: NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: NAME,
    locale: "en_CA",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.png", alt: OG_ALT }],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: NAME,
      url: SITE_URL,
      image: `${SITE_URL}/ty-color.jpg`,
      email: EMAIL,
      jobTitle: ROLE_TITLE,
      description: SITE_DESCRIPTION,
      worksFor: { "@type": "Organization", name: "micro1", url: "https://www.micro1.ai/" },
      address: { "@type": "PostalAddress", addressLocality: "Vancouver", addressRegion: "BC", addressCountry: "CA" },
      sameAs: [LINKEDIN_URL, X_URL, DRIBBBLE_URL],
      knowsAbout: ["Product design", "UX design", "Design systems", "UX engineering", "AI workflow UX", "AI workflows and analytics"],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#service`,
      name: `${NAME} — Freelance Product & UX Design`,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      provider: { "@id": `${SITE_URL}/#person` },
      areaServed: ["Vancouver", "Canada", "Remote"],
      serviceType: ["Product design", "UX design", "Design systems", "UX strategy"],
    },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: NAME, publisher: { "@id": `${SITE_URL}/#person` } },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA" className={`${mono.variable} ${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}",
          }}
        />
      </head>
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
