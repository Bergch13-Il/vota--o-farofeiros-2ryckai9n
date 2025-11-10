import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  getDishesWithVotes,
  addDish as addDishService,
  deleteDishesByParty,
} from '@/services/dishes'
import { addVote, getUserVotesForParty } from '@/services/votes'
import { EventType, DishWithVotes } from '@/types'

export const useDishes = () => {
  const [dishes, setDishes] = useState<DishWithVotes[]>([])
  const [votedDishes, setVotedDishes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [partyType, setPartyType] = useState<EventType>('natal')

  const { user, ensureUser } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const currentPartyType = location.pathname.includes('/reveillon')
      ? 'reveillon'
      : 'natal'
    setPartyType(currentPartyType)
  }, [location.pathname])

  const fetchDishesAndVotes = useCallback(async () => {
    setIsLoading(true)
    try {
      const ensuredUser = user ?? (await ensureUser())
      const [dishesData, userVotesData] = await Promise.all([
        getDishesWithVotes(partyType),
        ensuredUser ? getUserVotesForParty(ensuredUser.id, partyType) : [] as string[],
      ])
      setDishes(dishesData)
      setVotedDishes(userVotesData)
    } catch (error) {
      console.error('Failed to fetch dishes and votes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, partyType])

  useEffect(() => {
    ensureUser()
  }, [ensureUser])

  useEffect(() => {
    fetchDishesAndVotes()
  }, [fetchDishesAndVotes])

  const addDish = async (name: string) => {
    const ensuredUser = user ?? (await ensureUser())
    if (!ensuredUser) {
      return {
        success: false,
        message: 'Não foi possível criar um usuário para registrar o prato.',
      }
    }
    const result = await addDishService(name, partyType, ensuredUser.id)
    if (result.success) {
      await fetchDishesAndVotes()
    }
    return result
  }

  const voteForDish = async (dishId: string) => {
    const ensuredUser = user ?? (await ensureUser())
    if (!ensuredUser) {
      return {
        success: false,
        message: 'Não foi possível criar um usuário para registrar o voto.',
      }
    }
    if (votedDishes.includes(dishId)) {
      return { success: false, message: 'Você já votou neste prato.' }
    }
    const result = await addVote(dishId, ensuredUser.id)
    if (result.success) {
      await fetchDishesAndVotes()
    }
    return result
  }

  const resetDishes = async () => {
    const result = await deleteDishesByParty(partyType)
    if (result.success) {
      await fetchDishesAndVotes()
    }
    return result
  }

  const maxVotes =
    dishes.length > 0 ? Math.max(...dishes.map((d) => d.votes || 0)) : 0
  const winningDishIds =
    maxVotes > 0
      ? dishes.filter((d) => d.votes === maxVotes).map((d) => d.id)
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
