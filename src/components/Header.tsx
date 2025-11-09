import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export const Header = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const location = useLocation()
  const [theme, setTheme] = useState('natal')

  useEffect(() => {
    if (location.pathname.includes('reveillon')) {
      setTheme('reveillon')
    } else {
      setTheme('natal')
    }
  }, [location.pathname])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'transition-colors hover:text-primary pb-1',
      isActive
        ? 'text-primary border-b-2 border-primary'
        : 'text-muted-foreground',
    )

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-lg font-semibold transition-colors hover:text-primary',
      isActive ? 'text-primary' : 'text-foreground',
    )

  const navLinks = (
    <>
      <NavLink
        to="/natal"
        className={navLinkClass}
        onClick={() => setIsSheetOpen(false)}
      >
        Natal
      </NavLink>
      <NavLink
        to="/reveillon"
        className={navLinkClass}
        onClick={() => setIsSheetOpen(false)}
      >
        Réveillon
      </NavLink>
    </>
  )

  return (
    <header
      className={cn('sticky top-0 z-50 w-full border-b bg-card shadow-sm', {
        'theme-natal': theme === 'natal',
        'theme-reveillon': theme === 'reveillon',
      })}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-7 w-7 text-primary" />
          <span className="font-logo text-2xl font-bold text-primary">
            Os Farofeiros
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks}
        </nav>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="grid gap-6 text-lg font-medium mt-8">
              {navLinks}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
