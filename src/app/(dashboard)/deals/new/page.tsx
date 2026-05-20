import { DealForm } from '@/components/deals/deal-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { contacts, pipelineStages } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function NewDealPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { organizationId } = session.user

  const pipeline = await db.query.pipelines.findFirst({
    where: (p, { and, eq }) =>
      and(eq(p.organizationId, organizationId), eq(p.isDefault, 'true')),
  })

  if (!pipeline) redirect('/deals')

  const [stages, contactList] = await Promise.all([
    db.query.pipelineStages.findMany({
      where: eq(pipelineStages.pipelineId, pipeline.id),
      orderBy: asc(pipelineStages.order),
    }),
    db.query.contacts.findMany({
      where: eq(contacts.organizationId, organizationId),
      orderBy: asc(contacts.firstName),
      columns: { id: true, firstName: true, lastName: true },
    }),
  ])

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='icon' asChild>
          <Link href='/deals'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-semibold'>Nuevo negocio</h1>
          <p className='text-muted-foreground text-sm'>
            Agrega una oportunidad al pipeline
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del negocio</CardTitle>
        </CardHeader>
        <CardContent>
          <DealForm
            stages={stages}
            contacts={contactList}
            pipelineId={pipeline.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
