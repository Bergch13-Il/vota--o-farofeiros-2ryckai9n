import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { EventType, DishWithVotes } from '@/types'
import {
  getDishesWithVotes,
  addDish as addDishService,
  deleteDishesByParty,
} from '@/services/dishes'
import { addVote, getUserVotesForParty } from '@/services/votes'
import { supabase } from '@/lib/supabase/client'

export const useDishes = (partyType: EventType) => {
  const { user } = useAuth()
  const [dishes, setDishes] = useState<DishWithVotes[]>([])
  const [votedDishes, setVotedDishes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDishesAndVotes = useCallback(async () => {
    // Don't set loading to true here to avoid flashes on real-time updates
    const dishesData = await getDishesWithVotes(partyType)
    setDishes(dishesData)
    if (user) {
      const userVotesData = await getUserVotesForParty(user.id, partyType)
      setVotedDishes(userVotesData)
    }
    setIsLoading(false)
  }, [partyType, user])

  useEffect(() => {
    setIsLoading(true)
    fetchDishesAndVotes()

    const channel = supabase
      .channel(`public-dishes-votes-${partyType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dishes',
          filter: `party_type=eq.${partyType}`,
        },
        () => fetchDishesAndVotes(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => fetchDishesAndVotes(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partyType, fetchDishesAndVotes])

  const addDish = async (name: string) => {
    if (!user)
      return {
        success: false,
        message: 'Você precisa estar logado para sugerir um prato.',
      }
    return addDishService(name, partyType, user.id)
  }

  const voteForDish = async (dishId: string) => {
    if (!user)
      return {
        success: false,
        message: 'Você precisa estar logado para votar.',
      }
    if (votedDishes.includes(dishId))
      return { success: false, message: 'Você já votou neste prato.' }

    const result = await addVote(dishId, user.id)
    if (result.success) {
      setVotedDishes((prev) => [...prev, dishId])
    }
    return result
  }

  const resetDishes = async () => {
    return deleteDishesByParty(partyType)
  }

  const winningDishIds =
    dishes.length > 0 && dishes[0].votes > 0
      ? dishes.filter((d) => d.votes === dishes[0].votes).map((d) => d.id)
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
