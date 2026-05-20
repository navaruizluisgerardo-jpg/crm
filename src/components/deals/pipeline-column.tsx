'use client'

import { Badge } from '@/components/ui/badge'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DealCard } from './deal-card'

type Deal = {
  deal: {
    id: string
    title: string
    value: string | null
    currency: string | null
    probability: number | null
    expectedClose: Date | null
  }
  contact?: { firstName: string; lastName: string | null } | null
  company?: { name: string } | null
}

type Stage = {
  id: string
  name: string
  color: string | null
  probability: number | null
  deals: Deal[]
}

export function PipelineColumn({ stage }: { stage: Stage }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  const totalValue = stage.deals.reduce(
    (acc, d) => acc + Number(d.deal.value ?? 0),
    0,
  )

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(totalValue)

  return (
    <div className='flex flex-col w-72 shrink-0'>
      {/* Header de columna */}
      <div className='flex items-center justify-between mb-3 px-1'>
        <div className='flex items-center gap-2'>
          <div
            className='h-2.5 w-2.5 rounded-full shrink-0'
            style={{ backgroundColor: stage.color ?? '#6366f1' }}
          />
          <span className='text-sm font-medium'>{stage.name}</span>
          <Badge variant='secondary' className='text-xs'>
            {stage.deals.length}
          </Badge>
        </div>
        <span className='text-xs text-muted-foreground font-medium'>
          {formattedTotal}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg p-2 min-h-24 transition-colors ${
          isOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/30'
        }`}
      >
        <SortableContext
          items={stage.deals.map((d) => d.deal.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className='space-y-2'>
            {stage.deals.map(({ deal, contact, company }) => (
              <DealCard
                key={deal.id}
                deal={deal}
                contact={contact}
                company={company}
              />
            ))}
            {stage.deals.length === 0 && (
              <div className='flex items-center justify-center h-20 text-xs text-muted-foreground'>
                Arrastra deals aquí
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
