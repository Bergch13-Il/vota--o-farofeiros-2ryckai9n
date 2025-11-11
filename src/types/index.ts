export interface Dish {
  id: string
  name: string
  party_type: EventType
  created_at: string
  user_id: string | null
}

export interface DishWithVotes extends Dish {
  votes: number
}

export interface Vote {
  id: string
  dish_id: string
  user_id: string | null
  created_at: string
}

export type EventType = 'natal' | 'reveillon'

export type UserRole = 'user' | 'admin'
