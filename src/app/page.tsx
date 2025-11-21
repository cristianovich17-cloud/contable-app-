import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Bienvenido a Contable App</h1>
        <p className="text-gray-600 mb-8">Sistema integral de contabilidad para asociación de socios</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card Socios */}
          <Link href="/socios" className="p-6 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition">
            <h2 className="text-2xl font-bold mb-2 text-blue-600">👥 Gestión de Socios</h2>
            <p className="text-gray-700 mb-4">Administra registro, importación y datos de socios. Configura cuotas, registra descuentos y créditos.</p>
            <div className="text-sm text-gray-600">
              <ul className="list-disc pl-5">
                <li>Importar socios desde Excel</li>
                <li>Configurar cuotas mensuales</li>
                <li>Registrar descuentos y créditos</li>
                <li>Generar recibos en PDF</li>
                <li>Registrar pagos</li>
              </ul>
            </div>
          </Link>

          {/* Card Reportes */}
          <Link href="/reportes" className="p-6 border-2 border-green-500 rounded-lg hover:bg-green-50 transition">
            <h2 className="text-2xl font-bold mb-2 text-green-600">📊 Reportes</h2>
            <p className="text-gray-700 mb-4">Visualiza reportes mensuales, anuales y comparativas. Identifica morosos y balances.</p>
            <div className="text-sm text-gray-600">
              <ul className="list-disc pl-5">
                <li>Resumen mensual de ingresos/egresos</li>
                <li>Balance anual consolidado</li>
                <li>Comparativa entre años</li>
                <li>Informe de morosos</li>
                <li>Análisis por categoría</li>
              </ul>
            </div>
          </Link>
        </div>

        {/* Características */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Funcionalidades Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-lg mb-2">✅ Implementadas</h3>
              <ul className="text-sm space-y-1">
                <li>✓ Gestión completa de socios</li>
                <li>✓ Importación masiva desde Excel</li>
                <li>✓ Configuración de cuotas</li>
                <li>✓ Descuentos y créditos</li>
                <li>✓ Recibos mensuales (PDF + JSON)</li>
                <li>✓ Registro de pagos</li>
                <li>✓ Ingresos y egresos categorizados</li>
                <li>✓ Reportes mensuales y anuales</li>
                <li>✓ Análisis comparativo anual</li>
                <li>✓ Informe de morosos</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">📅 En Desarrollo</h3>
              <ul className="text-sm space-y-1">
                <li>⏳ Exportación a Excel avanzada</li>
                <li>⏳ Sistema de autenticación</li>
                <li>⏳ Gestión de presupuestos</li>
                <li>⏳ Reminders automáticos de pago</li>
                <li>⏳ Integración pagos online</li>
                <li>⏳ Dashboard con gráficos</li>
                <li>⏳ Control de acceso por usuario</li>
                <li>⏳ Auditoría de cambios</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info técnica */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm">
          <p className="font-semibold mb-2">💻 Información Técnica</p>
          <p className="text-gray-700">
            Construido con <strong>Next.js 14</strong>, <strong>React 18</strong>, <strong>TypeScript</strong> y <strong>Tailwind CSS</strong>. 
            Almacenamiento local con <strong>lowdb</strong> (JSON). 
            Exportación de reportes con <strong>pdfkit</strong> para recibos en PDF.
          </p>
        </div>
      </div>
    </div>
  )
}
