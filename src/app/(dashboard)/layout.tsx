import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { auth } from '@/lib/auth'
import { getUserWithOrg } from '@/lib/db/queries/user'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const data = await getUserWithOrg(session.user.id)

  return (
    <div className='flex h-screen overflow-hidden bg-background'>
      <Sidebar
        organizationName={data?.organization?.name}
        userName={session.user.name}
        userRole={session.user.role}
      />
      <div className='flex flex-1 flex-col overflow-hidden'>
        <Header userName={session.user.name} userEmail={session.user.email} />
        <main className='flex-1 overflow-y-auto p-6'>{children}</main>
      </div>
    </div>
  )
}
