import { PipelineBoard } from '@/components/deals/pipeline-board'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { getPipelineWithDeals } from '@/lib/db/queries/deals'
import { Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DealsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const data = await getPipelineWithDeals(session.user.organizationId)

  if (!data) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <TrendingUp className='h-12 w-12 text-muted-foreground mb-4' />
        <h2 className='text-lg font-semibold'>No hay pipeline configurado</h2>
        <p className='text-muted-foreground text-sm mt-1'>
          Ejecuta el seed para crear el pipeline por defecto
        </p>
      </div>
    )
  }

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(data.totalValue)

  return (
    <div className='space-y-6 h-full'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>Pipeline de ventas</h1>
          <p className='text-muted-foreground text-sm mt-1'>
            {data.totalDeals} negocio{data.totalDeals !== 1 ? 's' : ''} ·{' '}
            {formattedTotal} en total
          </p>
        </div>
        <Button asChild>
          <Link href='/deals/new'>
            <Plus className='h-4 w-4 mr-2' />
            Nuevo negocio
          </Link>
        </Button>
      </div>

      {/* Kanban */}
      <PipelineBoard initialStages={data.stages as any} />
    </div>
  )
}
