import { useState, useEffect } from 'react'
import { Dish, EventType } from '@/types'
import * as api from '@/lib/mock-api'
import { dishStore } from '@/stores/dish-store'

const getVotedDishesFromStorage = (eventType: EventType): string[] => {
  try {
    const item = localStorage.getItem(`voted-dishes-${eventType}`)
    return item ? JSON.parse(item) : []
  } catch (error) {
    console.error('Failed to read voted dishes from storage', error)
    return []
  }
}

const setVotedDishesInStorage = (eventType: EventType, ids: string[]) => {
  try {
    localStorage.setItem(`voted-dishes-${eventType}`, JSON.stringify(ids))
  } catch (error) {
    console.error('Failed to write voted dishes to storage', error)
  }
}

export const useDishes = (eventType: EventType) => {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [votedDishes, setVotedDishes] = useState<string[]>(() =>
    getVotedDishesFromStorage(eventType),
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleStateChange = (state: { natal: Dish[]; reveillon: Dish[] }) => {
      const sortedDishes = [...state[eventType]].sort(
        (a, b) => b.votes - a.votes || a.name.localeCompare(b.name),
      )
      setDishes(sortedDishes)
      setIsLoading(false)
    }

    const unsubscribe = dishStore.subscribe(handleStateChange)
    handleStateChange(dishStore.getState())

    return () => unsubscribe()
  }, [eventType])

  const addDish = async (name: string) => {
    return await api.addDish(eventType, name)
  }

  const voteForDish = async (id: string) => {
    if (votedDishes.includes(id)) {
      return { success: false, message: 'Você já votou neste prato.' }
    }
    const result = await api.voteForDish(eventType, id)
    if (result.success) {
      const newVotedDishes = [...votedDishes, id]
      setVotedDishes(newVotedDishes)
      setVotedDishesInStorage(eventType, newVotedDishes)
    }
    return result
  }

  const resetDishes = async () => {
    const result = await api.resetDishes(eventType)
    if (result.success) {
      setVotedDishes([])
      setVotedDishesInStorage(eventType, [])
    }
    return result
  }

  const winningDishId =
    dishes.length > 0 && dishes[0].votes > 0 ? dishes[0].id : null

  return {
    dishes,
    votedDishes,
    addDish,
    voteForDish,
    resetDishes,
    winningDishId,
    isLoading,
  }
}
