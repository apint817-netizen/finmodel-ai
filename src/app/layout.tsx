import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'FinModel AI - Финансовое моделирование с ИИ',
  description: 'Создавайте, анализируйте и оптимизируйте финансовые модели для любого бизнеса с помощью искусственного интеллекта',
};

import { auth } from '@/auth';
import { NextAuthProvider } from '@/components/providers/SessionProvider';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased">
        <NextAuthProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
