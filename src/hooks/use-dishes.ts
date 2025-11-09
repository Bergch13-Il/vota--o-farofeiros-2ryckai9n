import { useState, useEffect, useMemo, useCallback } from 'react'
import { Dish, EventType } from '@/types'
import * as api from '@/lib/mock-api'

const getVotedDishesFromStorage = (eventType: EventType): string[] => {
  try {
    const key = `voted-dishes-${eventType}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to get voted dishes from storage', error)
    return []
  }
}

const saveVotedDishesToStorage = (eventType: EventType, ids: string[]) => {
  try {
    const key = `voted-dishes-${eventType}`
    localStorage.setItem(key, JSON.stringify(ids))
  } catch (error) {
    console.error('Failed to save voted dishes to storage', error)
  }
}

export const useDishes = (eventType: EventType) => {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [votedDishes, setVotedDishes] = useState<string[]>(() =>
    getVotedDishesFromStorage(eventType),
  )

  const fetchDishes = useCallback(async () => {
    try {
      const fetchedDishes = await api.getDishes(eventType)
      setDishes(fetchedDishes)
    } catch (error) {
      console.error(`Failed to fetch ${eventType} dishes`, error)
    } finally {
      setIsLoading(false)
    }
  }, [eventType])

  useEffect(() => {
    fetchDishes()
    const interval = setInterval(fetchDishes, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [fetchDishes])

  useEffect(() => {
    saveVotedDishesToStorage(eventType, votedDishes)
  }, [votedDishes, eventType])

  const addDish = useCallback(
    async (name: string) => {
      const result = await api.addDish(eventType, name)
      if (result.success) {
        setDishes(result.dishes)
      }
      return { success: result.success, message: result.message }
    },
    [eventType],
  )

  const voteForDish = useCallback(
    async (id: string) => {
      if (votedDishes.includes(id)) return

      setVotedDishes((prev) => [...prev, id])
      // Optimistic update
      setDishes((prevDishes) =>
        prevDishes
          .map((dish) =>
            dish.id === id ? { ...dish, votes: dish.votes + 1 } : dish,
          )
          .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name)),
      )

      const result = await api.voteForDish(eventType, id)
      if (!result.success) {
        // Revert optimistic update on failure
        setVotedDishes((prev) => prev.filter((votedId) => votedId !== id))
        fetchDishes() // Refetch to be sure
      }
    },
    [eventType, votedDishes, fetchDishes],
  )

  const winningDishId = useMemo(() => {
    if (dishes.length === 0) return null
    const maxVotes = Math.max(...dishes.map((d) => d.votes))
    if (maxVotes === 0) return null
    const winners = dishes.filter((d) => d.votes === maxVotes)
    return winners.length === 1 ? winners[0].id : null
  }, [dishes])

  return { dishes, votedDishes, addDish, voteForDish, winningDishId, isLoading }
}
