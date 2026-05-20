import { db } from '@/lib/db'
import { companies, contacts, users } from '@/lib/db/schema'
import type { ContactFilters } from '@/lib/validations/contacts'
import { and, count, desc, eq, ilike, or } from 'drizzle-orm'

export async function getContacts(
  organizationId: string,
  filters: ContactFilters,
) {
  const { search, status, source, ownerId, page, limit } = filters
  const offset = (page - 1) * limit

  // Construir condiciones dinámicamente
  const conditions = [eq(contacts.organizationId, organizationId)]

  if (status) conditions.push(eq(contacts.status, status))
  if (source) conditions.push(eq(contacts.source, source))
  if (ownerId) conditions.push(eq(contacts.ownerId, ownerId))
  if (search) {
    conditions.push(
      or(
        ilike(contacts.firstName, `%${search}%`),
        ilike(contacts.lastName, `%${search}%`),
        ilike(contacts.email, `%${search}%`),
        ilike(contacts.phone, `%${search}%`),
      )!,
    )
  }

  const where = and(...conditions)

  // Query principal con joins
  const rows = await db
    .select({
      contact: contacts,
      company: {
        id: companies.id,
        name: companies.name,
      },
      owner: {
        id: users.id,
        name: users.name,
      },
    })
    .from(contacts)
    .leftJoin(companies, eq(contacts.companyId, companies.id))
    .leftJoin(users, eq(contacts.ownerId, users.id))
    .where(where)
    .orderBy(desc(contacts.createdAt))
    .limit(limit)
    .offset(offset)

  // Total para paginación
  const [{ total }] = await db
    .select({ total: count() })
    .from(contacts)
    .where(where)

  return {
    data: rows,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  }
}

export async function getContactById(id: string, organizationId: string) {
  const result = await db
    .select({
      contact: contacts,
      company: companies,
      owner: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(contacts)
    .leftJoin(companies, eq(contacts.companyId, companies.id))
    .leftJoin(users, eq(contacts.ownerId, users.id))
    .where(
      and(eq(contacts.id, id), eq(contacts.organizationId, organizationId)),
    )
    .limit(1)

  return result[0] ?? null
}
