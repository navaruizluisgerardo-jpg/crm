'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createDealAction, updateDealAction } from '@/lib/actions/deals'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Stage = { id: string; name: string }
type Contact = { id: string; firstName: string; lastName: string | null }

interface DealFormProps {
  stages: Stage[]
  contacts: Contact[]
  pipelineId: string
  deal?: {
    id: string
    title: string
    value: string | null
    currency: string | null
    stageId: string | null
    contactId: string | null
    probability: number | null
    expectedClose: Date | null
    notes: string | null
  }
  onSuccess?: () => void
}

export function DealForm({
  stages,
  contacts,
  pipelineId,
  deal,
  onSuccess,
}: DealFormProps) {
  const router = useRouter()
  const isEdit = !!deal?.id

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [stageId, setStageId] = useState(deal?.stageId ?? stages[0]?.id ?? '')
  const [contactId, setContactId] = useState(deal?.contactId ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)

    const data = {
      title: form.get('title') as string,
      value: form.get('value') as string,
      probability: form.get('probability') as string,
      expectedClose: form.get('expectedClose') as string,
      notes: form.get('notes') as string,
      currency: 'MXN',
      stageId,
      pipelineId,
      ...(contactId ? { contactId } : {}),
    }

    const result = isEdit
      ? await updateDealAction(deal.id, data)
      : await createDealAction(data)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    onSuccess?.()
    router.push('/deals')
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <div className='space-y-2'>
        <Label htmlFor='title'>Título del negocio *</Label>
        <Input
          id='title'
          name='title'
          defaultValue={deal?.title}
          placeholder='Ej: Implementación ERP para Acme'
          required
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='value'>Valor (MXN)</Label>
          <Input
            id='value'
            name='value'
            type='number'
            min='0'
            defaultValue={deal?.value ?? '0'}
            placeholder='0'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='probability'>Probabilidad (%)</Label>
          <Input
            id='probability'
            name='probability'
            type='number'
            min='0'
            max='100'
            defaultValue={deal?.probability ?? '0'}
            placeholder='0'
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label>Etapa</Label>
        <Select value={stageId} onValueChange={setStageId}>
          <SelectTrigger>
            <SelectValue placeholder='Seleccionar etapa' />
          </SelectTrigger>
          <SelectContent>
            {stages.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label>Contacto asociado</Label>
        <Select value={contactId} onValueChange={setContactId}>
          <SelectTrigger>
            <SelectValue placeholder='Seleccionar contacto (opcional)' />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='expectedClose'>Fecha esperada de cierre</Label>
        <Input
          id='expectedClose'
          name='expectedClose'
          type='date'
          defaultValue={
            deal?.expectedClose
              ? new Date(deal.expectedClose).toISOString().split('T')[0]
              : ''
          }
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='notes'>Notas</Label>
        <Textarea
          id='notes'
          name='notes'
          defaultValue={deal?.notes ?? ''}
          placeholder='Detalles del negocio...'
          rows={3}
        />
      </div>

      {error && <p className='text-sm text-destructive'>{error}</p>}

      <div className='flex gap-3 justify-end pt-2'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type='submit' disabled={loading}>
          {loading
            ? isEdit
              ? 'Guardando...'
              : 'Creando...'
            : isEdit
              ? 'Guardar cambios'
              : 'Crear negocio'}
        </Button>
      </div>
    </form>
  )
}
