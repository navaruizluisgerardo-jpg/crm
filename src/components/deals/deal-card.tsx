'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, DollarSign, GripVertical } from 'lucide-react'
import Link from 'next/link'

type DealCardProps = {
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

export function DealCard({ deal, contact, company }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const formattedValue = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: deal.currency ?? 'MXN',
    maximumFractionDigits: 0,
  }).format(Number(deal.value ?? 0))

  return (
    <div ref={setNodeRef} style={style}>
      <Card className='group cursor-pointer hover:shadow-md transition-shadow'>
        <CardContent className='p-3 space-y-2'>
          {/* Drag handle + título */}
          <div className='flex items-start gap-2'>
            <div
              {...attributes}
              {...listeners}
              className='mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0'
            >
              <GripVertical className='h-4 w-4' />
            </div>
            <Link
              href={`/deals/${deal.id}`}
              className='text-sm font-medium leading-tight hover:underline flex-1'
              onClick={(e) => e.stopPropagation()}
            >
              {deal.title}
            </Link>
          </div>

          {/* Empresa o contacto */}
          {(company || contact) && (
            <p className='text-xs text-muted-foreground pl-6 truncate'>
              {company?.name ??
                `${contact?.firstName} ${contact?.lastName ?? ''}`}
            </p>
          )}

          {/* Valor y probabilidad */}
          <div className='flex items-center justify-between pl-6'>
            <div className='flex items-center gap-1 text-sm font-semibold text-emerald-600'>
              <DollarSign className='h-3 w-3' />
              {formattedValue}
            </div>
            {deal.probability !== null && (
              <Badge variant='outline' className='text-xs'>
                {deal.probability}%
              </Badge>
            )}
          </div>

          {/* Fecha esperada de cierre */}
          {deal.expectedClose && (
            <div className='flex items-center gap-1 text-xs text-muted-foreground pl-6'>
              <Calendar className='h-3 w-3' />
              {new Intl.DateTimeFormat('es-MX', {
                day: 'numeric',
                month: 'short',
              }).format(new Date(deal.expectedClose))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
