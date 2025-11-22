import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Contable App - Sistema de Contabilidad",
  description: "Sistema moderno de contabilidad para asociación de socios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-secondary-950 text-secondary-50`}>
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-secondary-900 border-b border-secondary-800 backdrop-blur-lg bg-opacity-95 shadow-modern">
          <div className="container-custom">
            <div className="flex items-center justify-between py-4">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg group-hover:shadow-modern transition-all">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="font-bold text-lg gradient-text hidden sm:inline">Contable Pro</span>
              </Link>

              {/* Menu Links */}
              <div className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-secondary-300 hover:text-primary-400 transition-colors font-medium">Inicio</Link>
                <Link href="/dashboard" className="text-secondary-300 hover:text-primary-400 transition-colors font-medium">Dashboard</Link>
                <Link href="/socios" className="text-secondary-300 hover:text-primary-400 transition-colors font-medium">Socios</Link>
                <Link href="/transacciones" className="text-secondary-300 hover:text-primary-400 transition-colors font-medium">Transacciones</Link>
                <Link href="/reportes" className="text-secondary-300 hover:text-primary-400 transition-colors font-medium">Reportes</Link>
                <Link href="/auditoria" className="text-secondary-300 hover:text-primary-400 transition-colors font-medium">Auditoría</Link>
              </div>

              {/* Auth Button */}
              <div className="flex items-center gap-3">
                <Link href="/login" className="btn-primary text-sm">Login</Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-secondary-900 border-t border-secondary-800 py-8 mt-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-4 gradient-text">Contable Pro</h3>
                <p className="text-secondary-400 text-sm">Sistema moderno de contabilidad para asociaciones y cooperativas.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Producto</h4>
                <ul className="space-y-2 text-sm text-secondary-400">
                  <li><Link href="/dashboard" className="hover:text-primary-400">Dashboard</Link></li>
                  <li><Link href="/reportes" className="hover:text-primary-400">Reportes</Link></li>
                  <li><Link href="/socios" className="hover:text-primary-400">Gestión</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2 text-sm text-secondary-400">
                  <li><a href="#" className="hover:text-primary-400">Sobre Nosotros</a></li>
                  <li><a href="#" className="hover:text-primary-400">Contacto</a></li>
                  <li><a href="#" className="hover:text-primary-400">Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Soporte</h4>
                <ul className="space-y-2 text-sm text-secondary-400">
                  <li><a href="https://github.com/cristianovich17-cloud/contable-app-" className="hover:text-primary-400">GitHub</a></li>
                  <li><a href="#" className="hover:text-primary-400">Documentación</a></li>
                  <li><a href="#" className="hover:text-primary-400">Estado</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-secondary-700 pt-8 flex flex-col md:flex-row justify-between items-center text-secondary-400 text-sm">
              <p>&copy; 2025 Contable Pro. Todos los derechos reservados.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-primary-400">Privacidad</a>
                <a href="#" className="hover:text-primary-400">Términos</a>
                <a href="#" className="hover:text-primary-400">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
