import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinModel AI - Финансовое моделирование с ИИ',
  description: 'Создавайте, анализируйте и оптимизируйте финансовые модели для любого бизнеса с помощью искусственного интеллекта',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
