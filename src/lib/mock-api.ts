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

const getDatabase = (): { natal: Dish[]; reveillon: Dish[] } => {
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

const saveDatabase = (db: { natal: Dish[]; reveillon: Dish[] }) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch (error) {
    console.error('Failed to write to localStorage', error)
  }
}

const simulateDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const getDishes = async (eventType: EventType): Promise<Dish[]> => {
  await simulateDelay(300)
  const db = getDatabase()
  return db[eventType].sort(
    (a, b) => b.votes - a.votes || a.name.localeCompare(b.name),
  )
}

export const addDish = async (
  eventType: EventType,
  name: string,
): Promise<{ success: boolean; message: string; dishes: Dish[] }> => {
  await simulateDelay(500)
  const db = getDatabase()
  const dishes = db[eventType]

  if (dishes.some((dish) => dish.name.toLowerCase() === name.toLowerCase())) {
    return {
      success: false,
      message: 'Este prato já foi sugerido!',
      dishes,
    }
  }

  const newDish: Dish = {
    id: `${eventType}-${Date.now()}`,
    name,
    votes: 0,
  }

  db[eventType].push(newDish)
  saveDatabase(db)

  const sortedDishes = db[eventType].sort(
    (a, b) => b.votes - a.votes || a.name.localeCompare(b.name),
  )

  return {
    success: true,
    message: 'Prato sugerido com sucesso!',
    dishes: sortedDishes,
  }
}

export const voteForDish = async (
  eventType: EventType,
  id: string,
): Promise<{ success: boolean; message: string; dishes: Dish[] }> => {
  await simulateDelay(200)
  const db = getDatabase()
  const dish = db[eventType].find((d) => d.id === id)

  if (dish) {
    dish.votes += 1
    saveDatabase(db)
    const sortedDishes = db[eventType].sort(
      (a, b) => b.votes - a.votes || a.name.localeCompare(b.name),
    )
    return {
      success: true,
      message: 'Voto computado!',
      dishes: sortedDishes,
    }
  }

  return {
    success: false,
    message: 'Prato não encontrado.',
    dishes: db[eventType],
  }
}
