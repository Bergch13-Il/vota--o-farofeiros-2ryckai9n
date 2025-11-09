import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export default function Layout() {
  const location = useLocation()
  const [themeClass, setThemeClass] = useState('theme-natal')

  useEffect(() => {
    if (location.pathname.includes('/reveillon')) {
      setThemeClass('theme-reveillon')
    } else {
      setThemeClass('theme-natal')
    }
  }, [location.pathname])

  return (
    <div className={cn('flex flex-col min-h-screen', themeClass)}>
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
