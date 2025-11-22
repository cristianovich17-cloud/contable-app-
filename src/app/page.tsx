import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-secondary-950">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container-custom max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Contable Pro</span>
            </h1>
            <p className="text-xl text-secondary-300 mb-8 max-w-2xl mx-auto">
              Sistema moderno de contabilidad para asociaciones y cooperativas. Gestiona socios, reportes y documentos con facilidad.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/dashboard" className="btn-primary px-6 py-3 text-base">
                Ir al Dashboard
              </Link>
              <Link href="/login" className="btn-outline px-6 py-3 text-base">
                Inicia Sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-secondary-900 bg-opacity-50">
        <div className="container-custom max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Funcionalidades Principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Link href="/socios" className="card group hover:border-primary-500">
              <div className="p-3 bg-primary-500 text-white rounded-lg w-fit mb-4 group-hover:bg-primary-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Gestión de Socios</h3>
              <p className="text-secondary-400 text-sm mb-4">
                Administra registro, importación masiva desde Excel y datos completos de socios.
              </p>
              <ul className="space-y-2 text-sm text-secondary-300">
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Importación masiva
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Cuotas mensuales
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Descuentos y créditos
                </li>
              </ul>
            </Link>

            {/* Feature 2 */}
            <Link href="/reportes" className="card group hover:border-primary-500">
              <div className="p-3 bg-primary-500 text-white rounded-lg w-fit mb-4 group-hover:bg-primary-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2V17zm4 0h-2V7h2V17zm4 0h-2v-4h2V17z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Reportes Inteligentes</h3>
              <p className="text-secondary-400 text-sm mb-4">
                Visualiza reportes mensuales, anuales y comparativas detalladas.
              </p>
              <ul className="space-y-2 text-sm text-secondary-300">
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Resumen mensual
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Balance anual
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Informe de morosos
                </li>
              </ul>
            </Link>

            {/* Feature 3 */}
            <Link href="/transacciones" className="card group hover:border-primary-500">
              <div className="p-3 bg-primary-500 text-white rounded-lg w-fit mb-4 group-hover:bg-primary-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9.5c0 .83-.67 1.5-1.5 1.5S11 13.33 11 12.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Transacciones</h3>
              <p className="text-secondary-400 text-sm mb-4">
                Registra ingresos y egresos categorizados con trazabilidad completa.
              </p>
              <ul className="space-y-2 text-sm text-secondary-300">
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Categorización
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Por período
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Auditoría
                </li>
              </ul>
            </Link>

            {/* Feature 4 */}
            <div className="card">
              <div className="p-3 bg-primary-500 text-white rounded-lg w-fit mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Documentos PDF</h3>
              <p className="text-secondary-400 text-sm mb-4">
                Genera recibos profesionales en PDF para cada socio por mes.
              </p>
              <ul className="space-y-2 text-sm text-secondary-300">
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Recibos mensuales
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Exportación Excel
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Email automático
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="card">
              <div className="p-3 bg-primary-500 text-white rounded-lg w-fit mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Seguridad</h3>
              <p className="text-secondary-400 text-sm mb-4">
                Autenticación JWT, encriptación de contraseñas y auditoría completa.
              </p>
              <ul className="space-y-2 text-sm text-secondary-300">
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Autenticación JWT
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Auditoría
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Encriptación
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="card">
              <div className="p-3 bg-primary-500 text-white rounded-lg w-fit mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">En Tiempo Real</h3>
              <p className="text-secondary-400 text-sm mb-4">
                Actualización instantánea de datos y cálculos automáticos.
              </p>
              <ul className="space-y-2 text-sm text-secondary-300">
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Cálculos automáticos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Sync en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span> Cache inteligente
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Tecnología Moderna</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-2xl mb-2">⚡</p>
              <h4 className="font-bold">Next.js 14</h4>
              <p className="text-sm text-secondary-400">Framework React moderno</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl mb-2">🔷</p>
              <h4 className="font-bold">TypeScript</h4>
              <p className="text-sm text-secondary-400">Tipado estático</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl mb-2">🎨</p>
              <h4 className="font-bold">Tailwind CSS</h4>
              <p className="text-sm text-secondary-400">Diseño responsive</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl mb-2">🗄️</p>
              <h4 className="font-bold">Prisma ORM</h4>
              <p className="text-sm text-secondary-400">Base de datos</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl mb-2">🔐</p>
              <h4 className="font-bold">JWT Auth</h4>
              <p className="text-sm text-secondary-400">Autenticación segura</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl mb-2">🚀</p>
              <h4 className="font-bold">Fly.io</h4>
              <p className="text-sm text-secondary-400">Deployment cloud</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl mb-2">📊</p>
              <h4 className="font-bold">Chart.js</h4>
              <p className="text-sm text-secondary-400">Gráficos interactivos</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl mb-2">📧</p>
              <h4 className="font-bold">Nodemailer</h4>
              <p className="text-sm text-secondary-400">Email automático</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-blue">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-white mb-4">¿Listo para comenzar?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Accede al dashboard y comienza a gestionar tu asociación de forma moderna y eficiente.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard" className="btn-primary bg-white text-primary-600 hover:bg-secondary-100">
              Ir al Dashboard →
            </Link>
            <Link href="/login" className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-all">
              Inicia Sesión
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
