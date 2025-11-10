import { supabase } from '@/lib/supabase/client'
import { EventType } from '@/types'

export const addVote = async (
  dishId: string,
  userId: string,
): Promise<{ success: boolean; message: string }> => {
  const { error } = await supabase
    .from('votes')
    .insert([{ dish_id: dishId, user_id: userId }])

  if (error) {
    console.error('Error adding vote:', error)
    if (error.code === '23505') {
      return { success: false, message: 'Você já votou neste prato.' }
    }
    return { success: false, message: error.message }
  }
  return { success: true, message: 'Voto computado!' }
}

export const getUserVotesForParty = async (
  userId: string,
  partyType: EventType,
): Promise<string[]> => {
  const { data, error } = await supabase
    .from('votes')
    .select('dish_id, dishes!inner(party_type)')
    .eq('user_id', userId)
    .eq('dishes.party_type', partyType)

  if (error) {
    console.error('Error fetching user votes:', error)
    return []
  }

  return data.map((vote) => vote.dish_id)
}
