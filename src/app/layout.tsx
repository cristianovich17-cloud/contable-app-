import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Contable App",
  description: "Sistema de contabilidad para asociación de socios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <nav className="bg-gray-800 text-white p-4 mb-4">
          <div className="container mx-auto flex gap-4 flex-wrap">
            <Link href="/" className="font-bold hover:text-blue-400">Inicio</Link>
            <Link href="/socios" className="hover:text-blue-400">Socios</Link>
            <Link href="/transacciones" className="hover:text-blue-400">Transacciones</Link>
            <Link href="/reportes" className="hover:text-blue-400">Reportes</Link>
            <Link href="/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <Link href="/auditoria" className="hover:text-blue-400">Auditoría</Link>
            <Link href="/login" className="hover:text-blue-400">Login</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
