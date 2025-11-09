import { Dish, EventType } from '@/types'
import { dishStore } from '@/stores/dish-store'

const simulateDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const getDishes = async (eventType: EventType): Promise<Dish[]> => {
  await simulateDelay(100)
  const state = dishStore.getState()
  return state[eventType]
}

export const addDish = async (
  eventType: EventType,
  name: string,
): Promise<{ success: boolean; message: string }> => {
  await simulateDelay(500)
  const result = dishStore.addDish(eventType, name)
  return { ...result }
}

export const voteForDish = async (
  eventType: EventType,
  id: string,
): Promise<{ success: boolean; message: string }> => {
  await simulateDelay(200)
  const result = dishStore.voteForDish(eventType, id)
  return { ...result }
}

export const resetDishes = async (
  eventType: EventType,
): Promise<{ success: boolean; message: string }> => {
  await simulateDelay(300)
  const result = dishStore.resetDishes(eventType)
  return { ...result }
}
