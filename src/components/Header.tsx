import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getAvatarUrl } from '@/lib/avatar'

export const Header = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [theme, setTheme] = useState('natal')

  useEffect(() => {
    setTheme(location.pathname.includes('reveillon') ? 'reveillon' : 'natal')
  }, [location.pathname])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'transition-colors hover:text-primary pb-1',
      isActive
        ? 'text-primary border-b-2 border-primary'
        : 'text-muted-foreground',
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

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

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
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navLinks}
          </nav>
          {user && !user.is_anonymous ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getAvatarUrl(user.id)}
                      alt={user.email ?? 'User avatar'}
                    />
                    <AvatarFallback>
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Logado como
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/login">Admin Login</Link>
            </Button>
          )}
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
      </div>
    </header>
  )
}
