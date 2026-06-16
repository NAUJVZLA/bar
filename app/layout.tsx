import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALCO Servicio Gastro Bar - POS Multisede",
  description: "El sistema POS definitivo para ALCO Servicio Gastro Bar. Gestión de inventarios, mapa de mesas interactivas y ventas en barra en tiempo real.",
  keywords: "POS, Bar, Gastro Bar, Inventario, Mesas, Ventas, Restaurante, Admin, ALCO",
  authors: [{ name: "ALCO Tech" }],
  icons: {
    icon: "/favicon.ico?v=4",
    shortcut: "/favicon.ico?v=4",
    apple: "/apple-touch-icon.png?v=4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#030303] text-[#f8fafc] font-sans selection:bg-[#f59e0b]/30 selection:text-white">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('ServiceWorker registrado con éxito:', reg.scope);
                  }).catch(function(err) {
                    console.error('Error al registrar ServiceWorker:', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
