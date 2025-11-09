import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const Index = () => {
  return (
    <div className="flex flex-col">
      <section className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 gradient-natal animate-gradient opacity-70" />
        <div className="container relative z-10 px-4 text-center text-white">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl font-display font-bold tracking-tighter sm:text-6xl md:text-7xl">
              Bem-vindos, Os Farofeiros!
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-lg md:text-xl">
              Vamos escolher os pratos mais deliciosos para o nosso Natal e
              Réveillon!
            </p>
          </div>
          <img
            src="https://img.usecurling.com/p/500/500?q=happy%20family%20dinner%20illustration"
            alt="Ilustração de festa"
            className="mx-auto my-8 w-64 h-64 md:w-80 md:h-80 object-contain animate-float"
          />
          <div
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Button
              asChild
              size="lg"
              className={cn(
                'w-full sm:w-auto bg-natal-primary hover:bg-natal-primary/90 text-white rounded-3xl px-8 py-6 text-lg font-bold shadow-lg transition-transform hover:scale-105',
              )}
            >
              <Link to="/natal">Votar no Cardápio de Natal</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className={cn(
                'w-full sm:w-auto bg-reveillon-primary hover:bg-reveillon-primary/90 text-white rounded-3xl px-8 py-6 text-lg font-bold shadow-lg transition-transform hover:scale-105',
              )}
            >
              <Link to="/reveillon">Votar no Cardápio de Réveillon</Link>
            </Button>
          </div>
          <p className="mt-12 max-w-2xl mx-auto text-base">
            Este é o nosso cantinho para decidir, de forma divertida e
            democrática, as delícias que vão compor nossas mesas de festa.
            Sugira, vote e vamos juntos fazer celebrações inesquecíveis!
          </p>
        </div>
      </section>
    </div>
  )
}

export default Index
