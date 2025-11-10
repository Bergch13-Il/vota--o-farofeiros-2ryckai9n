import { supabase } from '@/lib/supabase/client'
import { EventType, DishWithVotes } from '@/types'

export const getDishesWithVotes = async (
  partyType: EventType,
): Promise<DishWithVotes[]> => {
  const { data, error } = await supabase
    .from('dishes_with_votes')
    .select('*')
    .eq('party_type', partyType)
    .order('votes', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching dishes:', error)
    return []
  }
  return data as DishWithVotes[]
}

export const addDish = async (
  name: string,
  partyType: EventType,
  userId: string,
): Promise<{ success: boolean; message: string }> => {
  const { error } = await supabase
    .from('dishes')
    .insert([{ name, party_type: partyType, user_id: userId }])

  if (error) {
    console.error('Error adding dish:', error)
    if (error.code === '23505') {
      return { success: false, message: 'Este prato já foi sugerido!' }
    }
    return { success: false, message: error.message }
  }
  return { success: true, message: 'Prato sugerido com sucesso!' }
}

export const deleteDishesByParty = async (
  partyType: EventType,
): Promise<{ success: boolean; message: string }> => {
  const { error } = await supabase
    .from('dishes')
    .delete()
    .eq('party_type', partyType)

  if (error) {
    console.error('Error resetting voting:', error)
    return { success: false, message: error.message }
  }
  return { success: true, message: 'Votação reiniciada com sucesso!' }
}
