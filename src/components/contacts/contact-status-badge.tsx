import { Badge } from '@/components/ui/badge'

const statusConfig = {
  lead: {
    label: 'Lead',
    className: 'bg-blue-100   text-blue-800   border-blue-200',
  },
  prospect: {
    label: 'Prospecto',
    className: 'bg-amber-100  text-amber-800  border-amber-200',
  },
  customer: {
    label: 'Cliente',
    className: 'bg-green-100  text-green-800  border-green-200',
  },
  churned: {
    label: 'Perdido',
    className: 'bg-red-100    text-red-800    border-red-200',
  },
  partner: {
    label: 'Partner',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
} as const

type Status = keyof typeof statusConfig

export function ContactStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as Status] ?? statusConfig.lead
  return (
    <Badge variant='outline' className={config.className}>
      {config.label}
    </Badge>
  )
}
