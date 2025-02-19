
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import Topbar from '../single_file/Topbar';
 
export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale(); // Lấy ngôn ngữ hiện tại (từ cookies hoặc headers)
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body>
        {/* NextIntlClientProvider: cung cấp thông điệp
        messages: lấy thông điệp từ các file json trong thư mục messages */}
        <NextIntlClientProvider messages={messages}>
          <Topbar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}