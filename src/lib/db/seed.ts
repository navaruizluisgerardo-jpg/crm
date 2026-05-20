import { neon } from '@neondatabase/serverless'
import { createId } from '@paralleldrive/cuid2'
import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

// ─── Datos de ejemplo ────────────────────────────────────────────────────────

const COMPANIES = [
  {
    name: 'Acme Corp',
    domain: 'acme.com',
    industry: 'Tecnología',
    size: 'enterprise',
  },
  {
    name: 'Globex Solutions',
    domain: 'globex.com',
    industry: 'Consultoría',
    size: 'smb',
  },
  { name: 'Initech', domain: 'initech.com', industry: 'Finanzas', size: 'smb' },
  {
    name: 'Umbrella Co',
    domain: 'umbrella.com',
    industry: 'Salud',
    size: 'enterprise',
  },
  {
    name: 'Stark Industries',
    domain: 'stark.com',
    industry: 'Manufactura',
    size: 'enterprise',
  },
  {
    name: 'Dunder Mifflin',
    domain: 'dundermifflin.com',
    industry: 'Retail',
    size: 'startup',
  },
]

const CONTACTS = [
  {
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@acme.com',
    phone: '+52 55 1234 5678',
    jobTitle: 'Directora de Ventas',
    status: 'customer',
    source: 'referral',
    companyIdx: 0,
  },
  {
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos.lopez@globex.com',
    phone: '+52 55 2345 6789',
    jobTitle: 'Gerente General',
    status: 'prospect',
    source: 'web',
    companyIdx: 1,
  },
  {
    firstName: 'Ana',
    lastName: 'Martínez',
    email: 'ana.martinez@initech.com',
    phone: '+52 55 3456 7890',
    jobTitle: 'CFO',
    status: 'lead',
    source: 'cold',
    companyIdx: 2,
  },
  {
    firstName: 'Roberto',
    lastName: 'Hernández',
    email: 'roberto.h@umbrella.com',
    phone: '+52 55 4567 8901',
    jobTitle: 'VP de Operaciones',
    status: 'customer',
    source: 'event',
    companyIdx: 3,
  },
  {
    firstName: 'Laura',
    lastName: 'Sánchez',
    email: 'laura.sanchez@stark.com',
    phone: '+52 55 5678 9012',
    jobTitle: 'CTO',
    status: 'prospect',
    source: 'referral',
    companyIdx: 4,
  },
  {
    firstName: 'Diego',
    lastName: 'Ramírez',
    email: 'diego.ramirez@dunderm.com',
    phone: '+52 55 6789 0123',
    jobTitle: 'Director de Marketing',
    status: 'lead',
    source: 'social',
    companyIdx: 5,
  },
  {
    firstName: 'Sofía',
    lastName: 'Torres',
    email: 'sofia.torres@acme.com',
    phone: '+52 55 7890 1234',
    jobTitle: 'Gerente de Compras',
    status: 'customer',
    source: 'web',
    companyIdx: 0,
  },
  {
    firstName: 'Miguel',
    lastName: 'Flores',
    email: 'miguel.flores@globex.com',
    phone: '+52 55 8901 2345',
    jobTitle: 'Analista de Negocios',
    status: 'churned',
    source: 'cold',
    companyIdx: 1,
  },
  {
    firstName: 'Valentina',
    lastName: 'Ruiz',
    email: 'v.ruiz@initech.com',
    phone: '+52 55 9012 3456',
    jobTitle: 'Head of Product',
    status: 'prospect',
    source: 'event',
    companyIdx: 2,
  },
  {
    firstName: 'Andrés',
    lastName: 'Morales',
    email: 'andres.m@umbrella.com',
    phone: '+52 55 0123 4567',
    jobTitle: 'Sales Manager',
    status: 'lead',
    source: 'referral',
    companyIdx: 3,
  },
  {
    firstName: 'Isabella',
    lastName: 'Jiménez',
    email: 'isabella.j@stark.com',
    phone: '+52 55 1111 2222',
    jobTitle: 'Account Executive',
    status: 'customer',
    source: 'web',
    companyIdx: 4,
  },
  {
    firstName: 'Fernando',
    lastName: 'Castro',
    email: 'f.castro@dunderm.com',
    phone: '+52 55 2222 3333',
    jobTitle: 'Business Developer',
    status: 'partner',
    source: 'referral',
    companyIdx: 5,
  },
  {
    firstName: 'Camila',
    lastName: 'Vargas',
    email: 'camila.v@acme.com',
    phone: '+52 55 3333 4444',
    jobTitle: 'Marketing Manager',
    status: 'prospect',
    source: 'social',
    companyIdx: 0,
  },
  {
    firstName: 'Javier',
    lastName: 'Mendoza',
    email: 'javier.m@globex.com',
    phone: '+52 55 4444 5555',
    jobTitle: 'IT Director',
    status: 'lead',
    source: 'cold',
    companyIdx: 1,
  },
  {
    firstName: 'Lucía',
    lastName: 'Reyes',
    email: 'lucia.reyes@initech.com',
    phone: '+52 55 5555 6666',
    jobTitle: 'Procurement Manager',
    status: 'customer',
    source: 'event',
    companyIdx: 2,
  },
]

// ─── Seed ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Iniciando seed...\n')

  // 1. Buscar la primera organización existente
  const orgs = await db.query.organizations.findMany({ limit: 1 })
  if (orgs.length === 0) {
    console.error('❌ No hay organizaciones. Regístrate primero en /register')
    process.exit(1)
  }

  const org = orgs[0]!
  console.log(`✅ Usando organización: ${org.name} (${org.id})`)

  // 2. Buscar el usuario owner de esa org
  const owner = await db.query.users.findFirst({
    where: (u, { and, eq }) =>
      and(eq(u.organizationId, org.id), eq(u.role, 'owner')),
  })

  if (!owner) {
    console.error('❌ No se encontró el usuario owner')
    process.exit(1)
  }

  console.log(`✅ Owner encontrado: ${owner.name} (${owner.email})\n`)

  // 3. Crear empresas
  console.log('🏢 Creando empresas...')
  const createdCompanies = await db
    .insert(schema.companies)
    .values(
      COMPANIES.map((c) => ({
        ...c,
        id: createId(),
        organizationId: org.id,
        createdById: owner.id,
      })),
    )
    .returning()

  console.log(`   ✓ ${createdCompanies.length} empresas creadas`)

  // 4. Crear contactos
  console.log('👥 Creando contactos...')
  const createdContacts = await db
    .insert(schema.contacts)
    .values(
      CONTACTS.map((c) => ({
        id: createId(),
        organizationId: org.id,
        ownerId: owner.id,
        companyId: createdCompanies[c.companyIdx]?.id ?? null,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        jobTitle: c.jobTitle,
        status: c.status as any,
        source: c.source,
      })),
    )
    .returning()

  console.log(`   ✓ ${createdContacts.length} contactos creados`)

  // 5. Crear pipeline por defecto
  console.log('\n🔀 Creando pipeline de ventas...')
  const [pipeline] = await db
    .insert(schema.pipelines)
    .values({
      id: createId(),
      organizationId: org.id,
      name: 'Pipeline principal',
      isDefault: 'true',
    })
    .returning()

  const stages = [
    { name: 'Prospección', order: 1, probability: 10, color: '#6366f1' },
    { name: 'Calificación', order: 2, probability: 25, color: '#8b5cf6' },
    { name: 'Propuesta', order: 3, probability: 50, color: '#f59e0b' },
    { name: 'Negociación', order: 4, probability: 75, color: '#f97316' },
    { name: 'Cierre', order: 5, probability: 90, color: '#10b981' },
  ]

  const createdStages = await db
    .insert(schema.pipelineStages)
    .values(
      stages.map((s) => ({ ...s, id: createId(), pipelineId: pipeline!.id })),
    )
    .returning()

  console.log(`   ✓ Pipeline creado con ${createdStages.length} etapas`)

  // 6. Crear negocios de ejemplo
  console.log('\n💼 Creando negocios...')
  const dealNames = [
    {
      title: 'Renovación contrato anual',
      value: '45000',
      contactIdx: 0,
      stageIdx: 4,
    },
    {
      title: 'Implementación ERP',
      value: '120000',
      contactIdx: 1,
      stageIdx: 2,
    },
    { title: 'Consultoría Q1', value: '18000', contactIdx: 2, stageIdx: 1 },
    {
      title: 'Licencias software x50',
      value: '32000',
      contactIdx: 3,
      stageIdx: 3,
    },
    {
      title: 'Proyecto de automatización',
      value: '85000',
      contactIdx: 4,
      stageIdx: 2,
    },
    { title: 'Mantenimiento anual', value: '9600', contactIdx: 6, stageIdx: 0 },
    {
      title: 'Expansión módulo RRHH',
      value: '27500',
      contactIdx: 10,
      stageIdx: 3,
    },
    {
      title: 'Partnership integración API',
      value: '15000',
      contactIdx: 11,
      stageIdx: 4,
    },
  ]

  await db.insert(schema.deals).values(
    dealNames.map((d) => ({
      id: createId(),
      organizationId: org.id,
      pipelineId: pipeline!.id,
      stageId: createdStages[d.stageIdx]?.id ?? null,
      contactId: createdContacts[d.contactIdx]?.id ?? null,
      ownerId: owner.id,
      title: d.title,
      value: d.value,
      currency: 'MXN',
      status: 'open' as const,
      probability: stages[d.stageIdx]?.probability ?? 0,
      expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    })),
  )

  console.log(`   ✓ ${dealNames.length} negocios creados`)

  // 7. Crear actividades de ejemplo
  console.log('\n📋 Creando actividades...')
  await db.insert(schema.activities).values([
    {
      id: createId(),
      organizationId: org.id,
      userId: owner.id,
      contactId: createdContacts[0]?.id,
      type: 'call',
      title: 'Llamada de seguimiento',
      isDone: true,
      doneAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      id: createId(),
      organizationId: org.id,
      userId: owner.id,
      contactId: createdContacts[1]?.id,
      type: 'email',
      title: 'Envío de propuesta comercial',
      isDone: true,
      doneAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: createId(),
      organizationId: org.id,
      userId: owner.id,
      contactId: createdContacts[2]?.id,
      type: 'meeting',
      title: 'Reunión de presentación',
      isDone: false,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      createdAt: new Date(),
    },
    {
      id: createId(),
      organizationId: org.id,
      userId: owner.id,
      contactId: createdContacts[3]?.id,
      type: 'task',
      title: 'Preparar demo del producto',
      isDone: false,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      createdAt: new Date(),
    },
    {
      id: createId(),
      organizationId: org.id,
      userId: owner.id,
      contactId: createdContacts[0]?.id,
      type: 'note',
      title: 'Cliente interesado en renovar con descuento del 10%',
      isDone: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
  ])

  console.log('   ✓ 5 actividades creadas')

  console.log('\n✅ Seed completado exitosamente')
  console.log(`\n📊 Resumen:`)
  console.log(`   • ${createdCompanies.length} empresas`)
  console.log(`   • ${createdContacts.length} contactos`)
  console.log(`   • 1 pipeline con ${createdStages.length} etapas`)
  console.log(`   • ${dealNames.length} negocios`)
  console.log(`   • 5 actividades`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err)
  process.exit(1)
})
