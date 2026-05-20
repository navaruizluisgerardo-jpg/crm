import { z } from 'zod'

export const createContactSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().optional(),
  email: z.email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  companyId: z.string().optional(),
  status: z
    .enum(['lead', 'prospect', 'customer', 'churned', 'partner'])
    .default('lead'),
  source: z.string().optional(),
  notes: z.string().optional(),
})

export const updateContactSchema = createContactSchema.partial()

export const contactFiltersSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(['lead', 'prospect', 'customer', 'churned', 'partner'])
    .optional(),
  source: z.string().optional(),
  ownerId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
export type ContactFilters = z.infer<typeof contactFiltersSchema>
