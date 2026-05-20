import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import { CalendarCheck, DollarSign, TrendingUp, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

const kpis = [
  {
    title: 'Total contactos',
    value: '0',
    change: '+0 este mes',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Negocios abiertos',
    value: '0',
    change: 'En pipeline',
    icon: TrendingUp,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    title: 'Valor del pipeline',
    value: '$0',
    change: 'Proyectado',
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Actividades hoy',
    value: '0',
    change: 'Pendientes',
    icon: CalendarCheck,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className='space-y-6'>
      {/* Saludo */}
      <div>
        <h1 className='text-2xl font-semibold'>
          {greeting}, {session.user.name?.split(' ')[0]} 👋
        </h1>
        <p className='text-muted-foreground mt-1'>
          Aquí tienes el resumen de hoy
        </p>
      </div>

      {/* KPIs */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  {kpi.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${kpi.bg}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{kpi.value}</div>
                <p className='text-xs text-muted-foreground mt-1'>
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Placeholder para gráficas — Fase 6 */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='min-h-64'>
          <CardHeader>
            <CardTitle className='text-base'>Pipeline por etapa</CardTitle>
          </CardHeader>
          <CardContent className='flex items-center justify-center h-40 text-muted-foreground text-sm'>
            Los datos aparecerán cuando tengas negocios registrados
          </CardContent>
        </Card>
        <Card className='min-h-64'>
          <CardHeader>
            <CardTitle className='text-base'>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent className='flex items-center justify-center h-40 text-muted-foreground text-sm'>
            Las actividades aparecerán aquí
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
