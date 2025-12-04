import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script para reordenar socios por RUT (menor a mayor)
 * y reasignar números del 1 al N
 */
async function reorderSociosByRUT() {
  try {
    console.log('📋 Obteniendo socios...')
    const socios = await prisma.socio.findMany({
      orderBy: { numero: 'asc' }
    })

    console.log(`\n📊 Total de socios: ${socios.length}`)
    console.log('\n📌 Socios actuales (por número):')
    socios.slice(0, 5).forEach(s => {
      console.log(`   N°${s.numero}: RUT ${s.rut} - ${s.nombre}`)
    })
    if (socios.length > 5) {
      console.log(`   ... y ${socios.length - 5} más`)
    }

    // Ordenar por RUT (menor a mayor)
    console.log('\n🔄 Ordenando por RUT...')
    const sortedByRUT = [...socios].sort((a, b) => {
      // Normalizar RUTs para comparación numérica
      const rutA = parseInt(a.rut.replace(/[^0-9]/g, ''), 10)
      const rutB = parseInt(b.rut.replace(/[^0-9]/g, ''), 10)
      return rutA - rutB
    })

    console.log('\n✅ Socios después de ordenar por RUT:')
    sortedByRUT.slice(0, 5).forEach((s, idx) => {
      console.log(`   N°${idx + 1}: RUT ${s.rut} - ${s.nombre}`)
    })
    if (sortedByRUT.length > 5) {
      console.log(`   ... y ${sortedByRUT.length - 5} más`)
    }

    // Preparar cambios: mapear RUT viejo → numero nuevo
    console.log('\n🔄 Calculando cambios de números...')
    const updates = sortedByRUT.map((socio, newIndex) => {
      const newNumber = newIndex + 1
      return {
        id: socio.id,
        rut: socio.rut,
        nombre: socio.nombre,
        numeroAnterior: socio.numero,
        numeroNuevo: newNumber
      }
    })

    // Mostrar cambios
    console.log('\n📝 Primeros 10 cambios:')
    updates.slice(0, 10).forEach(u => {
      console.log(`   ${u.rut}: ${u.nombre}`)
      console.log(`      N° ${u.numeroAnterior} → N° ${u.numeroNuevo}`)
    })

    // Aplicar cambios en la BD
    // Usar un número temporal muy alto para evitar conflictos de constraints únicos
    console.log('\n⏳ Aplicando cambios en la base de datos...')
    
    // Paso 1: Asignar números temporales muy altos (1000+)
    console.log('   Paso 1: Asignando números temporales...')
    for (let i = 0; i < updates.length; i++) {
      const tempNumber = 10000 + i // Número temporal único
      await prisma.socio.update({
        where: { id: updates[i].id },
        data: { numero: tempNumber }
      })
    }
    console.log('   ✓ Números temporales asignados')

    // Paso 2: Asignar números finales
    console.log('   Paso 2: Asignando números finales...')
    for (const update of updates) {
      await prisma.socio.update({
        where: { id: update.id },
        data: { numero: update.numeroNuevo }
      })
    }
    console.log(`   ✓ Números finales asignados`)
    const actualizados = updates.length

    console.log(`\n✅ COMPLETADO: ${actualizados} socios reordenados`)

    // Verificar resultado
    console.log('\n🔍 Verificando resultado...')
    const final = await prisma.socio.findMany({
      orderBy: { numero: 'asc' }
    })

    console.log('\n✨ Resultado final:')
    final.forEach((s, idx) => {
      console.log(`   N°${s.numero}: RUT ${s.rut} - ${s.nombre}`)
      if (idx >= 9) {
        console.log(`   ... (${final.length - 10} más)`)
        return
      }
    })

    console.log('\n✅ Los socios ahora están ordenados por RUT del menor al mayor')
    console.log('✅ Los números van del 1 al ' + final.length)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

reorderSociosByRUT()
