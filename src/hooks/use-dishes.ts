import { useState, useEffect, useCallback } from 'react'
import { EventType, DishWithVotes } from '@/types'
import {
  getDishesWithVotes,
  addDish as addDishService,
  deleteDishesByParty,
} from '@/services/dishes'
import { addVote, getUserVotesForParty } from '@/services/votes'
import { useAuth } from './use-auth'
import { supabase } from '@/lib/supabase/client'

export const useDishes = (partyType: EventType) => {
  const { user } = useAuth()
  const [dishes, setDishes] = useState<DishWithVotes[]>([])
  const [votedDishes, setVotedDishes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDishesAndVotes = useCallback(async () => {
    // Don't set loading to true on refetch for better UX
    const fetchedDishes = await getDishesWithVotes(partyType)
    setDishes(fetchedDishes)
    if (user?.id) {
      const userVotes = await getUserVotesForParty(user.id, partyType)
      setVotedDishes(userVotes)
    }
    setIsLoading(false)
  }, [partyType, user?.id])

  useEffect(() => {
    setIsLoading(true)
    fetchDishesAndVotes()

    const channel = supabase
      .channel(`public-dishes-votes-${partyType}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dishes' },
        fetchDishesAndVotes,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        fetchDishesAndVotes,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchDishesAndVotes, partyType])

  const addDish = async (name: string) => {
    if (!user?.id) {
      return { success: false, message: 'Usuário não identificado.' }
    }
    return await addDishService(name, partyType, user.id)
  }

  const voteForDish = async (dishId: string) => {
    if (!user?.id) {
      return { success: false, message: 'Usuário não identificado.' }
    }
    if (votedDishes.includes(dishId)) {
      return { success: false, message: 'Você já votou neste prato.' }
    }
    const result = await addVote(dishId, user.id)
    if (result.success) {
      setVotedDishes((prev) => [...prev, dishId])
    }
    return result
  }

  const resetDishes = async () => {
    return await deleteDishesByParty(partyType)
  }

  const winningDishIds =
    dishes.length > 0 && dishes[0].votes > 0
      ? dishes
          .reduce((acc, dish) => {
            const maxVotes = acc.length > 0 ? acc[0].votes : 0
            if (dish.votes > maxVotes) {
              return [dish]
            }
            if (dish.votes === maxVotes) {
              acc.push(dish)
            }
            return acc
          }, [] as DishWithVotes[])
          .map((d) => d.id)
      : []

  return {
    dishes,
    votedDishes,
    addDish,
    voteForDish,
    resetDishes,
    winningDishIds,
    isLoading,
  }
}
