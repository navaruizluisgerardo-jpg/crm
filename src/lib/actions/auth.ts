'use server'

import { signIn } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizations, users } from '@/lib/db/schema'
import { loginSchema, registerSchema } from '@/lib/validations/auth' // 👈 agrega loginSchema
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { AuthError } from 'next-auth'

// Genera un slug único a partir del nombre de la organización
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .slice(0, 50)
}

export async function registerAction(data: unknown) {
  // 1. Validar datos
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { name, email, password, organizationName } = parsed.data

  // 2. Verificar si el email ya existe
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  })
  if (existing) {
    return { error: 'Ya existe una cuenta con ese email' }
  }

  // 3. Crear organización
  const slug = slugify(organizationName)
  const [org] = await db
    .insert(organizations)
    .values({ name: organizationName, slug })
    .returning()

  if (!org) return { error: 'Error al crear la organización' }

  // 4. Hash del password
  const passwordHash = await bcrypt.hash(password, 12)

  // 5. Crear usuario como owner
  await db.insert(users).values({
    name,
    email,
    passwordHash,
    organizationId: org.id,
    role: 'owner',
  })

  return { success: true }
}

export async function loginAction(data: unknown) {
  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Datos inválidos' }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email o contraseña incorrectos' }
    }
    return { error: 'Error inesperado' }
  }
}
