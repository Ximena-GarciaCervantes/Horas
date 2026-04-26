import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HORAS - Sistema de Producción RK',
  description: 'Dashboard de producción para máquinas RK',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-rk-light text-rk-dark">{children}</body>
    </html>
  );
}
