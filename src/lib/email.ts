import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

export async function getEmailTransporter() {
  if (transporter) return transporter

  // Validar que las variables de entorno estén configuradas
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    console.warn(
      'Email no configurado. Por favor, configura .env.local con SMTP_HOST, SMTP_USER y SMTP_PASSWORD'
    )
    return null
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  // Verificar conexión (no lanzar, solo aviso si falla)
  transporter.verify((err) => {
    if (err) {
      console.warn('Advertencia: No se pudo verificar conexión SMTP:', err.message || err)
    } else {
      console.log('SMTP verificado con éxito')
    }
  })

  return transporter
}

export async function enviarBoleta(
  destinatario: string,
  nombreSocio: string,
  numeroSocio: number | string,
  mes: number,
  año: number,
  pdfBuffer: Buffer,
  descuentosInfo: string
): Promise<{ success: boolean; mensaje: string }> {
  try {
    const transporter = await getEmailTransporter()

    if (!transporter) {
      return {
        success: false,
        mensaje:
          'Email no configurado. Configura las variables de entorno SMTP.',
      }
    }

    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ]
    const nombreMes = meses[mes - 1]

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: destinatario,
      subject: `Boleta de Descuentos - ${nombreSocio} (${nombreMes} ${año})`,
      html: `
        <h2>Boleta de Descuentos</h2>
        <p><strong>Socio:</strong> ${nombreSocio}</p>
        <p><strong>Número de Socio:</strong> ${numeroSocio}</p>
        <p><strong>Período:</strong> ${nombreMes} ${año}</p>
        <hr>
        <p>${descuentosInfo}</p>
        <hr>
        <p>Adjunto encontrará la boleta detallada en PDF.</p>
        <p>
          Saludos cordiales,<br>
          <strong>${process.env.SMTP_FROM_NAME || 'Contable App'}</strong>
        </p>
      `,
      attachments: [
        {
          filename: `boleta-${numeroSocio}-${nombreMes}-${año}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })

    return {
      success: true,
      mensaje: `Boleta enviada exitosamente a ${destinatario}`,
    }
  } catch (error) {
    console.error('Error al enviar boleta:', error)
    return {
      success: false,
      mensaje: `Error al enviar boleta: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    }
  }
}
