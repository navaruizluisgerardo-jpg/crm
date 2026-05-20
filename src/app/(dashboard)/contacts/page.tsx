import { ContactsTable } from '@/components/contacts/contacts-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { auth } from '@/lib/auth'
import { getContacts } from '@/lib/db/queries/contacts'
import { contactFiltersSchema } from '@/lib/validations/contacts'
import { UserPlus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function ContactsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const filters = contactFiltersSchema.parse(params)

  const { data, total, totalPages, page } = await getContacts(
    session.user.organizationId,
    filters,
  )

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>Contactos</h1>
          <p className='text-muted-foreground text-sm mt-1'>
            {total} contacto{total !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Button asChild>
          <Link href='/contacts/new'>
            <UserPlus className='h-4 w-4 mr-2' />
            Nuevo contacto
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className='flex gap-3 flex-wrap'>
        <form className='flex gap-3 flex-wrap flex-1'>
          <Input
            name='search'
            placeholder='Buscar por nombre, email o teléfono...'
            defaultValue={filters.search}
            className='max-w-sm'
          />
          <Select name='status' defaultValue={filters.status ?? 'all'}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Estado' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos</SelectItem>
              <SelectItem value='lead'>Lead</SelectItem>
              <SelectItem value='prospect'>Prospecto</SelectItem>
              <SelectItem value='customer'>Cliente</SelectItem>
              <SelectItem value='churned'>Perdido</SelectItem>
              <SelectItem value='partner'>Partner</SelectItem>
            </SelectContent>
          </Select>
          <Button type='submit' variant='secondary'>
            Filtrar
          </Button>
          {(filters.search || filters.status) && (
            <Button variant='ghost' asChild>
              <Link href='/contacts'>Limpiar</Link>
            </Button>
          )}
        </form>
      </div>

      {/* Tabla */}
      <ContactsTable contacts={data} page={page} totalPages={totalPages} />
    </div>
  )
}
