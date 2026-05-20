'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerAction } from '@/lib/actions/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const result = await registerAction({
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
      organizationName: form.get('organizationName'),
    })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Registro exitoso → redirigir al login
    router.push('/login?registered=true')
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-muted/40'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>Crear cuenta</CardTitle>
          <CardDescription>Empieza a usar tu CRM hoy</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='organizationName'>Nombre de tu empresa</Label>
              <Input
                id='organizationName'
                name='organizationName'
                placeholder='Acme Corp'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='name'>Tu nombre</Label>
              <Input id='name' name='name' placeholder='Juan Pérez' required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='tu@empresa.com'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Contraseña</Label>
              <Input
                id='password'
                name='password'
                type='password'
                placeholder='Mínimo 8 caracteres'
                required
              />
            </div>

            {error && <p className='text-sm text-destructive'>{error}</p>}

            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <p className='text-center text-sm text-muted-foreground mt-4'>
            ¿Ya tienes cuenta?{' '}
            <Link
              href='/login'
              className='text-primary underline-offset-4 hover:underline'
            >
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
