import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DishWithVotes } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarUrl } from '@/lib/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DishCardProps {
  dish: DishWithVotes
  onVote: (id: string) => void
  isVoted: boolean
  isWinner: boolean
}

export const DishCard = ({
  dish,
  onVote,
  isVoted,
  isWinner,
}: DishCardProps) => {
  return (
    <Card
      className={cn(
        'relative transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up',
        isWinner && 'border-2 border-amber-400 shadow-amber-400/20 shadow-lg',
      )}
    >
      {isWinner && (
        <div className="absolute -top-4 -right-4 bg-amber-400 text-white p-2 rounded-full shadow-lg animate-pulse-bright">
          <Crown className="h-6 w-6" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center font-display pt-8">
          {dish.name}
        </CardTitle>
        {dish.user_id && (
          <div className="absolute top-2 left-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage
                      src={getAvatarUrl(dish.user_id)}
                      alt="Sugestão de usuário"
                    />
                    <AvatarFallback>{dish.name[0]}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sugerido por um farofeiro!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="text-5xl font-bold text-primary">{dish.votes}</div>
        <Button
          onClick={() => onVote(dish.id)}
          disabled={isVoted}
          className={cn(
            'w-full transition-all',
            isVoted
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-interactive hover:bg-interactive/90',
          )}
        >
          <ThumbsUp className="mr-2 h-5 w-5" />
          {isVoted ? 'Votado!' : 'Votar'}
        </Button>
      </CardContent>
    </Card>
  )
}
