import PublicFloatingActions from "./components/PublicFloatingActions";
import "./globals.css";
import "./premium-marketing.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://oniriacity.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MALǓA | The Art of Living in Zanzibar",
    template: "%s | MALǓA",
  },
  description:
    "Discover MALǓA in Fumba, Zanzibar: private villas, modern residences, V Avenue, lifestyle amenities and opportunities to live, visit or invest.",
  applicationName: "MALǓA",
  category: "Real Estate",
  keywords: [
    "MALǓA",
    "Zanzibar real estate",
    "Fumba property",
    "Zanzibar villas",
    "Zanzibar residences",
    "V Avenue",
  ],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/malua-favicon.png",
    shortcut: "/malua-favicon.png",
    apple: "/malua-favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        {children}
        <PublicFloatingActions />
      </body>
    </html>
  );
}
