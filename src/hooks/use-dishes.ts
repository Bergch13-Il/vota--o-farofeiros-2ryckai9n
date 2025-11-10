import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getDishesWithVotes,
  addDish as addDishService,
  deleteDishesByParty,
} from '@/services/dishes'
import { addVote, getUserVotesForParty } from '@/services/votes'
import { DishWithVotes, EventType } from '@/types'

export const useDishes = (partyType: EventType) => {
  const { user } = useAuth()
  const [dishes, setDishes] = useState<DishWithVotes[]>([])
  const [votedDishes, setVotedDishes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [winningDishIds, setWinningDishIds] = useState<string[]>([])

  const fetchDishes = useCallback(async () => {
    setIsLoading(true)
    const fetchedDishes = await getDishesWithVotes(partyType)
    setDishes(fetchedDishes)

    if (fetchedDishes.length > 0) {
      const maxVotes = Math.max(...fetchedDishes.map((d) => d.votes || 0))
      if (maxVotes > 0) {
        const winners = fetchedDishes
          .filter((d) => d.votes === maxVotes)
          .map((d) => d.id as string)
        setWinningDishIds(winners)
      } else {
        setWinningDishIds([])
      }
    } else {
      setWinningDishIds([])
    }

    setIsLoading(false)
  }, [partyType])

  const fetchUserVotes = useCallback(async () => {
    if (user) {
      const userVotes = await getUserVotesForParty(user.id, partyType)
      setVotedDishes(userVotes)
    }
  }, [user, partyType])

  useEffect(() => {
    fetchDishes()
  }, [fetchDishes])

  useEffect(() => {
    if (user) {
      fetchUserVotes()
    }
  }, [user, fetchUserVotes])

  const addDish = async (name: string) => {
    if (!user) {
      return { success: false, message: 'Usuário não autenticado.' }
    }
    const result = await addDishService(name, partyType, user.id)
    if (result.success) {
      await fetchDishes()
    }
    return result
  }

  const voteForDish = async (dishId: string) => {
    if (!user) {
      return { success: false, message: 'Usuário não autenticado.' }
    }
    if (votedDishes.includes(dishId)) {
      return { success: false, message: 'Você já votou neste prato.' }
    }

    const result = await addVote(dishId, user.id)

    if (result.success) {
      setVotedDishes((prev) => [...prev, dishId])

      const newDishes = dishes.map((d) =>
        d.id === dishId ? { ...d, votes: (d.votes || 0) + 1 } : d,
      )
      setDishes(newDishes)

      const maxVotes = Math.max(...newDishes.map((d) => d.votes || 0))
      if (maxVotes > 0) {
        const winners = newDishes
          .filter((d) => d.votes === maxVotes)
          .map((d) => d.id as string)
        setWinningDishIds(winners)
      }
    }
    return result
  }

  const resetDishes = async () => {
    const result = await deleteDishesByParty(partyType)
    if (result.success) {
      await fetchDishes()
      await fetchUserVotes()
    }
    return result
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
