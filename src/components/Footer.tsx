import { UtensilsCrossed } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-muted py-4">
      <div className="container flex items-center justify-center text-sm text-muted-foreground">
        <UtensilsCrossed className="mr-2 h-4 w-4" />
        <span>Os Farofeiros © {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
