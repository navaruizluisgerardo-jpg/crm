'use client'

import { moveDealAction } from '@/lib/actions/deals'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { DealCard } from './deal-card'
import { PipelineColumn } from './pipeline-column'

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

export function PipelineBoard({ initialStages }: { initialStages: Stage[] }) {
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  // Encontrar en qué columna está un deal
  const findStageOfDeal = useCallback(
    (dealId: string) =>
      stages.find((s) => s.deals.some((d) => d.deal.id === dealId)),
    [stages],
  )

  function handleDragStart({ active }: DragStartEvent) {
    const stage = findStageOfDeal(active.id as string)
    const deal = stage?.deals.find((d) => d.deal.id === active.id)
    setActiveDeal(deal ?? null)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return

    const activeStage = findStageOfDeal(active.id as string)
    if (!activeStage) return

    // Determinar la columna destino
    const overStage =
      stages.find((s) => s.id === over.id) ?? // dropped on column
      findStageOfDeal(over.id as string) // dropped on another deal

    if (!overStage || activeStage.id === overStage.id) return

    setStages((prev) => {
      const activeDealObj = activeStage.deals.find(
        (d) => d.deal.id === active.id,
      )!

      return prev.map((stage) => {
        if (stage.id === activeStage.id) {
          return {
            ...stage,
            deals: stage.deals.filter((d) => d.deal.id !== active.id),
          }
        }
        if (stage.id === overStage.id) {
          return { ...stage, deals: [...stage.deals, activeDealObj] }
        }
        return stage
      })
    })
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveDeal(null)
    if (!over) return

    const overStage =
      stages.find((s) => s.id === over.id) ?? findStageOfDeal(over.id as string)

    if (!overStage) return

    // Persistir en BD
    const result = await moveDealAction({
      dealId: active.id as string,
      stageId: overStage.id,
    })

    if (result?.error) {
      toast.error('Error al mover el negocio')
      // Revertir al estado original
      setStages(initialStages)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className='flex gap-4 overflow-x-auto pb-4'>
        {stages.map((stage) => (
          <PipelineColumn key={stage.id} stage={stage} />
        ))}
      </div>

      {/* Overlay que se muestra mientras se arrastra */}
      <DragOverlay>
        {activeDeal && (
          <div className='rotate-2 opacity-90'>
            <DealCard
              deal={activeDeal.deal}
              contact={activeDeal.contact}
              company={activeDeal.company}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
