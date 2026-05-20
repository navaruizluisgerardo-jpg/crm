import { db } from '@/lib/db'
import {
  companies,
  contacts,
  deals,
  pipelineStages,
  pipelines,
  users,
} from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'

export async function getPipelineWithDeals(organizationId: string) {
  // Obtener el pipeline por defecto
  const pipeline = await db.query.pipelines.findFirst({
    where: (p, { and, eq }) =>
      and(eq(p.organizationId, organizationId), eq(p.isDefault, 'true')),
  })

  if (!pipeline) return null

  // Obtener etapas
  const stages = await db.query.pipelineStages.findMany({
    where: eq(pipelineStages.pipelineId, pipeline.id),
    orderBy: pipelineStages.order,
  })

  // Obtener todos los deals del pipeline con sus relaciones
  const allDeals = await db
    .select({
      deal: deals,
      contact: {
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
      },
      company: {
        id: companies.id,
        name: companies.name,
      },
      owner: {
        id: users.id,
        name: users.name,
      },
    })
    .from(deals)
    .leftJoin(contacts, eq(deals.contactId, contacts.id))
    .leftJoin(companies, eq(deals.companyId, companies.id))
    .leftJoin(users, eq(deals.ownerId, users.id))
    .where(
      and(eq(deals.organizationId, organizationId), eq(deals.status, 'open')),
    )
    .orderBy(desc(deals.createdAt))

  // Agrupar deals por etapa
  const stagesWithDeals = stages.map((stage) => ({
    ...stage,
    deals: allDeals.filter((d) => d.deal.stageId === stage.id),
  }))

  // Calcular métricas del pipeline
  const totalValue = allDeals.reduce(
    (acc, d) => acc + Number(d.deal.value ?? 0),
    0,
  )

  return {
    pipeline,
    stages: stagesWithDeals,
    totalDeals: allDeals.length,
    totalValue,
  }
}

export async function getDealById(id: string, organizationId: string) {
  const result = await db
    .select({
      deal: deals,
      contact: contacts,
      company: companies,
      owner: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(deals)
    .leftJoin(contacts, eq(deals.contactId, contacts.id))
    .leftJoin(companies, eq(deals.companyId, companies.id))
    .leftJoin(users, eq(deals.ownerId, users.id))
    .where(and(eq(deals.id, id), eq(deals.organizationId, organizationId)))
    .limit(1)

  return result[0] ?? null
}

export async function getAllPipelines(organizationId: string) {
  return db.query.pipelines.findMany({
    where: eq(pipelines.organizationId, organizationId),
  })
}
