import { useState, useEffect, useMemo } from 'react'
import { Dish, EventType } from '@/types'
import { dishStore } from '@/stores/dish-store'
import * as api from '@/lib/mock-api'

const getVotedDishesFromSession = (eventType: EventType): string[] => {
  try {
    const item = sessionStorage.getItem(`voted-${eventType}`)
    return item ? JSON.parse(item) : []
  } catch (error) {
    console.error('Failed to read from sessionStorage', error)
    return []
  }
}

const setVotedDishesInSession = (eventType: EventType, ids: string[]) => {
  try {
    sessionStorage.setItem(`voted-${eventType}`, JSON.stringify(ids))
  } catch (error) {
    console.error('Failed to write to sessionStorage', error)
  }
}

export const useDishes = (eventType: EventType) => {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [votedDishes, setVotedDishes] = useState<string[]>(() =>
    getVotedDishesFromSession(eventType),
  )

  useEffect(() => {
    const handleStateChange = (state: { natal: Dish[]; reveillon: Dish[] }) => {
      setDishes(sortDishes(state[eventType]))
      if (isLoading) {
        setIsLoading(false)
      }
    }

    const sortDishes = (dishesToSort: Dish[]): Dish[] => {
      return [...dishesToSort].sort(
        (a, b) => b.votes - a.votes || a.name.localeCompare(b.name),
      )
    }

    const unsubscribe = dishStore.subscribe(handleStateChange)

    return () => {
      unsubscribe()
    }
  }, [eventType, isLoading])

  const addDish = async (name: string) => {
    const result = await api.addDish(eventType, name)
    return result
  }

  const voteForDish = async (id: string) => {
    if (votedDishes.includes(id)) {
      return { success: false, message: 'Você já votou neste prato.' }
    }
    const result = await api.voteForDish(eventType, id)
    if (result.success) {
      const newVotedDishes = [...votedDishes, id]
      setVotedDishes(newVotedDishes)
      setVotedDishesInSession(eventType, newVotedDishes)
    }
    return result
  }

  const winningDishId = useMemo(() => {
    if (dishes.length === 0) return null
    const maxVotes = Math.max(...dishes.map((d) => d.votes))
    if (maxVotes === 0) return null
    const winners = dishes.filter((d) => d.votes === maxVotes)
    return winners.length > 0 ? winners[0].id : null
  }, [dishes])

  return {
    dishes,
    votedDishes,
    addDish,
    voteForDish,
    winningDishId,
    isLoading,
  }
}
