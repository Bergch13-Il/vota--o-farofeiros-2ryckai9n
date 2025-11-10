const AVATAR_KEYWORDS = [
  'star',
  'sun',
  'sea',
  'sky',
  'cloud',
  'moon',
  'mountain',
  'tree',
  'river',
  'flower',
  'comet',
  'galaxy',
]

/**
 * Generates a deterministic avatar URL based on a user ID.
 * @param userId The user's unique identifier.
 * @returns A URL for an abstract drawing avatar.
 */
export const getAvatarUrl = (userId: string): string => {
  if (!userId) {
    // Return a generic placeholder if userId is not available
    return `https://img.usecurling.com/p/128/128?q=abstract%20pattern`
  }
  // A simple hashing function to get a number from the string.
  const hash = userId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const index = hash % AVATAR_KEYWORDS.length
  const query = `${AVATAR_KEYWORDS[index]} abstract drawing`

  return `https://img.usecurling.com/p/128/128?q=${encodeURIComponent(query)}`
}
