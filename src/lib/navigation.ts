import {
  BarChart3,
  Building2,
  CalendarCheck,
  LayoutDashboard,
  Package,
  Settings,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

export const navigation = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Contactos', href: '/contacts', icon: Users },
      { label: 'Empresas', href: '/companies', icon: Building2 },
      { label: 'Negocios', href: '/deals', icon: TrendingUp },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { label: 'Actividades', href: '/activities', icon: CalendarCheck },
      { label: 'Productos', href: '/products', icon: Package },
      { label: 'Reportes', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Automatizaciones', href: '/automations', icon: Zap },
      { label: 'Configuración', href: '/settings', icon: Settings },
    ],
  },
]
