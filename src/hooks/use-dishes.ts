import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DishWithVotes, EventType } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import * as dishService from '@/services/dishes'
import * as voteService from '@/services/votes'

export const useDishes = (eventType: EventType) => {
  const { user } = useAuth()
  const [dishes, setDishes] = useState<DishWithVotes[]>([])
  const [votedDishes, setVotedDishes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const winningDishIds = useMemo(() => {
    if (dishes.length === 0 || dishes[0].votes === 0) return []
    const maxVotes = dishes[0].votes
    return dishes.filter((d) => d.votes === maxVotes).map((d) => d.id)
  }, [dishes])

  const fetchDishes = useCallback(async () => {
    setIsLoading(true)
    const data = await dishService.getDishesWithVotes(eventType)
    setDishes(data)
    setIsLoading(false)
  }, [eventType])

  const fetchUserVotes = useCallback(async () => {
    if (user) {
      const userVotes = await voteService.getUserVotesForParty(
        user.id,
        eventType,
      )
      setVotedDishes(userVotes)
    }
  }, [user, eventType])

  useEffect(() => {
    fetchDishes()
    fetchUserVotes()

    const channel = supabase
      .channel(`public:dishes:${eventType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dishes',
          filter: `party_type=eq.${eventType}`,
        },
        () => fetchDishes(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          fetchDishes()
          fetchUserVotes()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventType, fetchDishes, fetchUserVotes])

  const addDish = async (name: string) => {
    if (!user)
      return {
        success: false,
        message: 'Você precisa estar logado para sugerir um prato.',
      }
    return await dishService.addDish(name, eventType, user.id)
  }

  const voteForDish = async (id: string) => {
    if (!user)
      return {
        success: false,
        message: 'Você precisa estar logado para votar.',
      }
    const result = await voteService.addVote(id, user.id)
    if (result.success) {
      setVotedDishes((prev) => [...prev, id])
    }
    return result
  }

  const resetDishes = async () => {
    return await dishService.deleteDishesByParty(eventType)
  }

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
