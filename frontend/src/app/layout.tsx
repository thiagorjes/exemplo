import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// `next/font/local` é o padrão da coleção frontend/nextjs (fonte própria em
// src/assets/fonts/), mas o arquivo da fonte não está disponível neste ambiente de demo —
// usando `next/font/google` como alternativa documentada (mesma família, Inter).
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Cadastro de Clientes',
  description: 'Demo do flow IDSD — login e cadastro de clientes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
