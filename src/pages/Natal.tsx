import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { DishCard } from '@/components/DishCard'
import { useDishes } from '@/hooks/use-dishes'
import { TreePine } from 'lucide-react'
import { DishCardSkeleton } from '@/components/DishCardSkeleton'
import { ResetVoting } from '@/components/ResetVoting'
import { useAuth } from '@/hooks/use-auth'

const NatalPage = () => {
  const [newDishName, setNewDishName] = useState('')
  const {
    dishes,
    votedDishes,
    addDish,
    voteForDish,
    resetDishes,
    winningDishIds,
    isLoading,
  } = useDishes()
  const { isAdmin } = useAuth()
  const { toast } = useToast()

  const handleSuggestDish = async () => {
    if (newDishName.trim() === '') {
      toast({
        title: 'Erro',
        description: 'O nome do prato não pode ser vazio.',
        variant: 'destructive',
      })
      return
    }
    const result = await addDish(newDishName)
    toast({
      title: result.success ? 'Sucesso!' : 'Atenção',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
      className: result.success ? 'bg-success text-white' : '',
    })
    if (result.success) {
      setNewDishName('')
    }
  }

  const handleVote = async (id: string) => {
    const result = await voteForDish(id)
    if (!result.success) {
      toast({
        title: 'Atenção',
        description: result.message,
        variant: 'destructive',
      })
    }
  }

  const handleReset = async () => {
    const result = await resetDishes()
    toast({
      title: 'Sucesso!',
      description: result.message,
      className: 'bg-success text-white',
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold font-display text-natal-primary flex items-center justify-center gap-3">
          <TreePine className="h-10 w-10" />
          Cardápio de Natal
        </h1>
        <p className="text-muted-foreground mt-2">
          Sugira e vote nos pratos para a nossa ceia!
        </p>
      </header>

      <section
        className="max-w-2xl mx-auto mb-12 animate-fade-in-up"
        style={{ animationDelay: '0.2s' }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center font-display">
          Sugerir um Novo Prato
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Digite o nome do prato..."
            value={newDishName}
            onChange={(e) => setNewDishName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSuggestDish()}
            className="h-12 text-lg focus-visible:ring-natal-primary"
          />
          <Button
            onClick={handleSuggestDish}
            className="h-12 bg-success hover:bg-success/90 text-lg px-8"
          >
            Sugerir
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8 text-center font-display">
          Pratos para o Natal
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <DishCardSkeleton key={index} />
            ))}
          </div>
        ) : dishes.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhum prato foi sugerido ainda. Seja o primeiro!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {dishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onVote={handleVote}
                isVoted={votedDishes.includes(dish.id)}
                isWinner={winningDishIds.includes(dish.id)}
              />
            ))}
          </div>
        )}
      </section>

      {isAdmin && dishes.length > 0 && !isLoading && (
        <ResetVoting onReset={handleReset} eventName="Natal" />
      )}
    </div>
  )
}

export default NatalPage
