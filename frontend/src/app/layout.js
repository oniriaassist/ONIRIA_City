import PublicFloatingActions from "./components/PublicFloatingActions";
import "./globals.css";
import "./premium-marketing.css";

export const metadata = {
  title: {
    default: "ONIRIA City | The Art of Living in Zanzibar",
    template: "%s | ONIRIA City",
  },
  description:
    "Discover ONIRIA City in Fumba, Zanzibar: private villas, modern residences, V Avenue, lifestyle amenities and opportunities to live, visit or invest.",
  applicationName: "ONIRIA City",
  category: "Real Estate",
  keywords: [
    "ONIRIA City",
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
    icon: "/oniria-favicon.svg",
    shortcut: "/oniria-favicon.svg",
    apple: "/oniria-favicon.svg",
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
