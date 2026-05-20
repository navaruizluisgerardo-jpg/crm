'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { auditLogs, deals } from '@/lib/db/schema'
import {
  createDealSchema,
  moveDealSchema,
  updateDealSchema,
} from '@/lib/validations/deals'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function requireSession() {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('No autorizado')
  return session.user
}

export async function createDealAction(data: unknown) {
  const user = await requireSession()

  const parsed = createDealSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { expectedClose, value, ...rest } = parsed.data

  const [deal] = await db
    .insert(deals)
    .values({
      ...rest,
      value: String(value),
      organizationId: user.organizationId,
      ownerId: user.id,
      expectedClose: expectedClose ? new Date(expectedClose) : null,
    })
    .returning()

  if (!deal) return { error: 'Error al crear el negocio' }

  await db.insert(auditLogs).values({
    organizationId: user.organizationId,
    userId: user.id,
    action: 'created',
    entity: 'deal',
    entityId: deal.id,
  })

  revalidatePath('/deals')
  return { success: true, data: deal }
}

export async function moveDealAction(data: unknown) {
  const user = await requireSession()

  const parsed = moveDealSchema.safeParse(data)
  if (!parsed.success) return { error: 'Datos inválidos' }

  const { dealId, stageId } = parsed.data

  const [updated] = await db
    .update(deals)
    .set({ stageId, updatedAt: new Date() })
    .where(
      and(eq(deals.id, dealId), eq(deals.organizationId, user.organizationId)),
    )
    .returning()

  if (!updated) return { error: 'Negocio no encontrado' }

  revalidatePath('/deals')
  return { success: true }
}

export async function updateDealAction(id: string, data: unknown) {
  const user = await requireSession()

  const parsed = updateDealSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { expectedClose, value, ...rest } = parsed.data

  const [updated] = await db
    .update(deals)
    .set({
      ...rest,
      ...(value !== undefined ? { value: String(value) } : {}),
      ...(expectedClose !== undefined
        ? { expectedClose: expectedClose ? new Date(expectedClose) : null }
        : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(deals.id, id), eq(deals.organizationId, user.organizationId)))
    .returning()

  if (!updated) return { error: 'Negocio no encontrado' }

  revalidatePath('/deals')
  revalidatePath(`/deals/${id}`)
  return { success: true, data: updated }
}

export async function updateDealStatusAction(
  id: string,
  status: 'won' | 'lost',
  lostReason?: string,
) {
  const user = await requireSession()

  const [updated] = await db
    .update(deals)
    .set({
      status,
      closedAt: new Date(),
      lostReason: lostReason ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(deals.id, id), eq(deals.organizationId, user.organizationId)))
    .returning()

  if (!updated) return { error: 'Negocio no encontrado' }

  revalidatePath('/deals')
  return { success: true }
}

export async function deleteDealAction(id: string) {
  const user = await requireSession()

  const [deleted] = await db
    .delete(deals)
    .where(and(eq(deals.id, id), eq(deals.organizationId, user.organizationId)))
    .returning()

  if (!deleted) return { error: 'Negocio no encontrado' }

  revalidatePath('/deals')
  return { success: true }
}
