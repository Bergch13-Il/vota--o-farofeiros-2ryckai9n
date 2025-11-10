import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { EventType, DishWithVotes } from '@/types'
import {
  getDishesWithVotes,
  addDish as addDishService,
  deleteDishesByParty,
} from '@/services/dishes'
import {
  addVote as addVoteService,
  getUserVotesForParty,
} from '@/services/votes'
import { supabase } from '@/lib/supabase/client'

export const useDishes = (partyType: EventType) => {
  const { user } = useAuth()
  const [dishes, setDishes] = useState<DishWithVotes[]>([])
  const [votedDishes, setVotedDishes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [winningDishIds, setWinningDishIds] = useState<string[]>([])

  const fetchData = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    const [dishesData, votedData] = await Promise.all([
      getDishesWithVotes(partyType),
      getUserVotesForParty(user.id, partyType),
    ])

    setDishes(dishesData)
    setVotedDishes(votedData)

    if (dishesData.length > 0) {
      const maxVotes = Math.max(...dishesData.map((d) => d.votes ?? 0))
      if (maxVotes > 0) {
        const winners = dishesData
          .filter((d) => d.votes === maxVotes)
          .map((d) => d.id)
        setWinningDishIds(winners)
      } else {
        setWinningDishIds([])
      }
    } else {
      setWinningDishIds([])
    }

    setIsLoading(false)
  }, [partyType, user])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, fetchData])

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-dishes-votes-${partyType}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dishes' },
        (payload) => {
          console.log('Dishes change received!', payload)
          fetchData()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        (payload) => {
          console.log('Votes change received!', payload)
          fetchData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partyType, fetchData])

  const addDish = async (name: string) => {
    if (!user) return { success: false, message: 'Usuário não autenticado.' }
    return addDishService(name, partyType, user.id)
  }

  const voteForDish = async (dishId: string) => {
    if (!user) return { success: false, message: 'Usuário não autenticado.' }
    if (votedDishes.includes(dishId)) {
      return { success: false, message: 'Você já votou neste prato.' }
    }
    return addVoteService(dishId, user.id)
  }

  const resetDishes = async () => {
    return deleteDishesByParty(partyType)
  }

  return {
    dishes,
    votedDishes,
    isLoading,
    winningDishIds,
    addDish,
    voteForDish,
    resetDishes,
  }
}
