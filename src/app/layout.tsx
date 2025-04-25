
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import Topbar from '../components/Topbar';
import Script from 'next/script';
import './globals.css';


export const metadata = {
  title: "Home Page",
  description: "Home Page"
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale(); 
  const messages = await getMessages();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "My Website",
    "url": "https://mywebsite.com",
    "logo": "https://mywebsite.com/logo.png"
  };

  return (
    <html lang={locale}>
      <head>
        <Script
          type="application/ld+json"
          id="structured-data"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Topbar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}