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
import {
  createContactAction,
  updateContactAction,
} from '@/lib/actions/contacts'
import type { CreateContactInput } from '@/lib/validations/contacts'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Tipo del contacto existente para edición
type ExistingContact = Partial<CreateContactInput> & { id?: string }

interface ContactFormProps {
  contact?: ExistingContact
  onSuccess?: () => void
}

const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospecto' },
  { value: 'customer', label: 'Cliente' },
  { value: 'churned', label: 'Perdido' },
  { value: 'partner', label: 'Partner' },
]

const sourceOptions = [
  { value: 'web', label: 'Web' },
  { value: 'referral', label: 'Referido' },
  { value: 'cold', label: 'Frío' },
  { value: 'event', label: 'Evento' },
  { value: 'social', label: 'Redes sociales' },
  { value: 'other', label: 'Otro' },
]

export function ContactForm({ contact, onSuccess }: ContactFormProps) {
  const router = useRouter()
  const isEdit = !!contact?.id
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Estado para campos select (no funcionan con FormData nativamente)
  const [status, setStatus] = useState<CreateContactInput['status']>(
    contact?.status ?? 'lead',
  )
  const [source, setSource] = useState<string>(contact?.source ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)

    const data = {
      firstName: form.get('firstName') as string,
      lastName: form.get('lastName') as string,
      email: form.get('email') as string,
      phone: form.get('phone') as string,
      mobile: form.get('mobile') as string,
      jobTitle: form.get('jobTitle') as string,
      department: form.get('department') as string,
      notes: form.get('notes') as string,
      status,
      source,
    }

    const result = isEdit
      ? await updateContactAction(contact.id!, data)
      : await createContactAction(data)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    onSuccess?.()
    if (!isEdit) router.push('/contacts')
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      {/* Nombre */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='firstName'>Nombre *</Label>
          <Input
            id='firstName'
            name='firstName'
            defaultValue={contact?.firstName}
            placeholder='Juan'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='lastName'>Apellido</Label>
          <Input
            id='lastName'
            name='lastName'
            defaultValue={contact?.lastName}
            placeholder='Pérez'
          />
        </div>
      </div>

      {/* Contacto */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            name='email'
            type='email'
            defaultValue={contact?.email}
            placeholder='juan@empresa.com'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='phone'>Teléfono</Label>
          <Input
            id='phone'
            name='phone'
            defaultValue={contact?.phone}
            placeholder='+52 55 1234 5678'
          />
        </div>
      </div>

      {/* Trabajo */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='jobTitle'>Cargo</Label>
          <Input
            id='jobTitle'
            name='jobTitle'
            defaultValue={contact?.jobTitle}
            placeholder='Director de Ventas'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='department'>Departamento</Label>
          <Input
            id='department'
            name='department'
            defaultValue={contact?.department}
            placeholder='Comercial'
          />
        </div>
      </div>

      {/* Estado y fuente */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label>Estado</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as CreateContactInput["status"])}>
            <SelectTrigger>
              <SelectValue placeholder='Seleccionar estado' />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label>Fuente</Label>
          <Select value={source} onValueChange={(v) => setSource(v)}>
            <SelectTrigger>
              <SelectValue placeholder='Seleccionar fuente' />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notas */}
      <div className='space-y-2'>
        <Label htmlFor='notes'>Notas</Label>
        <Textarea
          id='notes'
          name='notes'
          defaultValue={contact?.notes}
          placeholder='Información adicional sobre el contacto...'
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
              : 'Crear contacto'}
        </Button>
      </div>
    </form>
  )
}
