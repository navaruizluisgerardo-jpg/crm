import { z } from 'zod'

export const createDealSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  value: z.coerce.number().min(0).default(0),
  currency: z.string().default('MXN'),
  stageId: z.string().min(1, 'La etapa es requerida'),
  pipelineId: z.string().min(1, 'El pipeline es requerido'),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  probability: z.coerce.number().min(0).max(100).default(0),
  expectedClose: z.string().optional(),
  notes: z.string().optional(),
})

export const updateDealSchema = createDealSchema.partial()

export const moveDealSchema = z.object({
  dealId: z.string(),
  stageId: z.string(),
})

export type CreateDealInput = z.infer<typeof createDealSchema>
export type UpdateDealInput = z.infer<typeof updateDealSchema>
export type MoveDealInput = z.infer<typeof moveDealSchema>
