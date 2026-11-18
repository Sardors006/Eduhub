import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'EduHub — Zamonaviy onlayn ta’lim platformasi',
  description:
    'Dasturlash, sun’iy intellekt, dizayn va kiberxavfsizlik bo‘yicha zamonaviy kurslar hamda xavfsiz ta’lim platformasi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body className="bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
