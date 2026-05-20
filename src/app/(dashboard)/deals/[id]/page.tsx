import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { auth } from '@/lib/auth'
import { getDealById } from '@/lib/db/queries/deals'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Pencil,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

const statusConfig = {
  open: { label: 'Abierto', className: 'bg-blue-100  text-blue-800' },
  won: { label: 'Ganado', className: 'bg-green-100 text-green-800' },
  lost: { label: 'Perdido', className: 'bg-red-100   text-red-800' },
  on_hold: { label: 'En pausa', className: 'bg-gray-100  text-gray-800' },
} as const

export default async function DealDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params
  const result = await getDealById(id, session.user.organizationId)

  if (!result) notFound()

  const { deal, contact, company, owner } = result

  const formattedValue = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: deal.currency ?? 'MXN',
    maximumFractionDigits: 0,
  }).format(Number(deal.value ?? 0))

  const status = statusConfig[deal.status as keyof typeof statusConfig]

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' asChild>
            <Link href='/deals'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-2xl font-semibold'>{deal.title}</h1>
              <Badge variant='outline' className={status?.className}>
                {status?.label}
              </Badge>
            </div>
            {company && (
              <p className='text-muted-foreground text-sm mt-1'>
                {company.name}
              </p>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/deals/${id}/edit`}>
            <Pencil className='h-4 w-4 mr-2' />
            Editar
          </Link>
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <div className='md:col-span-2 space-y-6'>
          {/* Métricas clave */}
          <div className='grid grid-cols-3 gap-4'>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center gap-2 text-muted-foreground mb-1'>
                  <DollarSign className='h-4 w-4' />
                  <span className='text-xs'>Valor</span>
                </div>
                <p className='text-xl font-bold text-emerald-600'>
                  {formattedValue}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center gap-2 text-muted-foreground mb-1'>
                  <TrendingUp className='h-4 w-4' />
                  <span className='text-xs'>Probabilidad</span>
                </div>
                <p className='text-xl font-bold'>{deal.probability ?? 0}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center gap-2 text-muted-foreground mb-1'>
                  <Calendar className='h-4 w-4' />
                  <span className='text-xs'>Cierre esperado</span>
                </div>
                <p className='text-sm font-semibold'>
                  {deal.expectedClose
                    ? new Intl.DateTimeFormat('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }).format(new Date(deal.expectedClose))
                    : '—'}
                </p>
              </CardContent>
            </Card>
          </div>

          {deal.notes && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {deal.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actividades — Fase 5 */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Actividades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Las actividades de este negocio aparecerán aquí
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Detalles</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              {contact && (
                <>
                  <div>
                    <p className='text-muted-foreground text-xs uppercase tracking-wide mb-1'>
                      Contacto
                    </p>
                    <Link
                      href={`/contacts/${contact.id}`}
                      className='hover:underline'
                    >
                      {contact.firstName} {contact.lastName}
                    </Link>
                  </div>
                  <Separator />
                </>
              )}
              <div>
                <p className='text-muted-foreground text-xs uppercase tracking-wide mb-1'>
                  Responsable
                </p>
                <p>{owner?.name ?? 'Sin asignar'}</p>
              </div>
              <Separator />
              <div>
                <p className='text-muted-foreground text-xs uppercase tracking-wide mb-1'>
                  Creado el
                </p>
                <p>
                  {new Intl.DateTimeFormat('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(new Date(deal.createdAt))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
