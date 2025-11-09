import { useState, useEffect, useCallback } from 'react'
import { Dish, EventType } from '@/types'

const getInitialDishes = (eventType: EventType): Dish[] => {
  try {
    const item = window.localStorage.getItem(`dishes_${eventType}`)
    return item ? JSON.parse(item) : []
  } catch (error) {
    console.error(error)
    return []
  }
}

const getInitialVotedDishes = (eventType: EventType): string[] => {
  try {
    const item = window.localStorage.getItem(`voted_dishes_${eventType}`)
    return item ? JSON.parse(item) : []
  } catch (error) {
    console.error(error)
    return []
  }
}

export const useDishes = (eventType: EventType) => {
  const [dishes, setDishes] = useState<Dish[]>(() =>
    getInitialDishes(eventType),
  )
  const [votedDishes, setVotedDishes] = useState<string[]>(() =>
    getInitialVotedDishes(eventType),
  )

  useEffect(() => {
    try {
      const sortedDishes = [...dishes].sort((a, b) => b.votes - a.votes)
      window.localStorage.setItem(
        `dishes_${eventType}`,
        JSON.stringify(sortedDishes),
      )
    } catch (error) {
      console.error(error)
    }
  }, [dishes, eventType])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        `voted_dishes_${eventType}`,
        JSON.stringify(votedDishes),
      )
    } catch (error) {
      console.error(error)
    }
  }, [votedDishes, eventType])

  const addDish = useCallback(
    (dishName: string): { success: boolean; message: string } => {
      const trimmedName = dishName.trim()
      if (
        dishes.some(
          (dish) => dish.name.toLowerCase() === trimmedName.toLowerCase(),
        )
      ) {
        return { success: false, message: 'Este prato já foi sugerido!' }
      }
      const newDish: Dish = {
        id: new Date().toISOString(),
        name: trimmedName,
        votes: 0,
      }
      setDishes((prevDishes) => [...prevDishes, newDish])
      return { success: true, message: 'Prato sugerido com sucesso!' }
    },
    [dishes],
  )

  const voteForDish = useCallback(
    (dishId: string) => {
      if (votedDishes.includes(dishId)) {
        return
      }
      setDishes((prevDishes) =>
        prevDishes.map((dish) =>
          dish.id === dishId ? { ...dish, votes: dish.votes + 1 } : dish,
        ),
      )
      setVotedDishes((prevVoted) => [...prevVoted, dishId])
    },
    [votedDishes],
  )

  const sortedDishes = [...dishes].sort((a, b) => b.votes - a.votes)
  const winningDishId =
    sortedDishes.length > 0 && sortedDishes[0].votes > 0
      ? sortedDishes[0].id
      : null

  return {
    dishes: sortedDishes,
    votedDishes,
    addDish,
    voteForDish,
    winningDishId,
  }
}
