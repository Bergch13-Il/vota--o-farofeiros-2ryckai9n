import { Dish, EventType } from '@/types'

const DB_KEY = 'farofeiros-db'

const initialData: { natal: Dish[]; reveillon: Dish[] } = {
  natal: [
    { id: 'natal-1', name: 'Peru Assado', votes: 5 },
    { id: 'natal-2', name: 'Bacalhoada', votes: 3 },
    { id: 'natal-3', name: 'Farofa de Frutas', votes: 8 },
  ],
  reveillon: [
    { id: 'reveillon-1', name: 'Lentilha da Sorte', votes: 10 },
    { id: 'reveillon-2', name: 'Salpicão de Frango', votes: 7 },
    { id: 'reveillon-3', name: 'Pudim de Leite', votes: 4 },
  ],
}

type DishState = {
  natal: Dish[]
  reveillon: Dish[]
}

type Listener = (state: DishState) => void

let state: DishState
const listeners: Set<Listener> = new Set()

const getDatabase = (): DishState => {
  try {
    const dbString = localStorage.getItem(DB_KEY)
    if (dbString) {
      return JSON.parse(dbString)
    }
    localStorage.setItem(DB_KEY, JSON.stringify(initialData))
    return initialData
  } catch (error) {
    console.error('Failed to read from localStorage', error)
    return initialData
  }
}

const saveDatabase = (db: DishState) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch (error) {
    console.error('Failed to write to localStorage', error)
  }
}

const notify = () => {
  listeners.forEach((listener) => listener(state))
}

const setState = (newState: DishState) => {
  state = newState
  saveDatabase(state)
  notify()
}

state = getDatabase()

window.addEventListener('storage', (event) => {
  if (event.key === DB_KEY && event.newValue) {
    try {
      const newState = JSON.parse(event.newValue)
      state = newState
      notify()
    } catch (error) {
      console.error('Failed to parse storage event data', error)
    }
  }
})

const sortDishes = (dishes: Dish[]): Dish[] => {
  return [...dishes].sort(
    (a, b) => b.votes - a.votes || a.name.localeCompare(b.name),
  )
}

export const dishStore = {
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener)
    listener(state)
    return () => {
      listeners.delete(listener)
    }
  },

  getState: (): DishState => {
    return {
      natal: sortDishes(state.natal),
      reveillon: sortDishes(state.reveillon),
    }
  },

  addDish: (
    eventType: EventType,
    name: string,
  ): { success: boolean; message: string } => {
    const dishes = state[eventType]
    if (dishes.some((dish) => dish.name.toLowerCase() === name.toLowerCase())) {
      return { success: false, message: 'Este prato já foi sugerido!' }
    }

    const newDish: Dish = {
      id: `${eventType}-${Date.now()}`,
      name,
      votes: 0,
    }

    const newState = {
      ...state,
      [eventType]: [...dishes, newDish],
    }
    setState(newState)

    return { success: true, message: 'Prato sugerido com sucesso!' }
  },

  voteForDish: (
    eventType: EventType,
    id: string,
  ): { success: boolean; message: string } => {
    const dishes = state[eventType]
    const dishIndex = dishes.findIndex((d) => d.id === id)

    if (dishIndex > -1) {
      const updatedDishes = [...dishes]
      updatedDishes[dishIndex] = {
        ...updatedDishes[dishIndex],
        votes: updatedDishes[dishIndex].votes + 1,
      }

      const newState = {
        ...state,
        [eventType]: updatedDishes,
      }
      setState(newState)
      return { success: true, message: 'Voto computado!' }
    }

    return { success: false, message: 'Prato não encontrado.' }
  },
}
