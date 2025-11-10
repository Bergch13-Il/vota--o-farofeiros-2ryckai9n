import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { getUserRole } from '@/services/users'

interface AuthContextType {
  user: User | null
  session: Session | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const checkUserRole = useCallback(async (userToCheck: User | null) => {
    if (userToCheck && !userToCheck.is_anonymous) {
      const role = await getUserRole(userToCheck.id)
      setIsAdmin(role === 'admin')
    } else {
      setIsAdmin(false)
    }
  }, [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      checkUserRole(currentUser)
      setLoading(false)
    })

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session)
        const currentUser = session.user
        setUser(currentUser)
        await checkUserRole(currentUser)
      } else {
        await supabase.auth.signInAnonymously()
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [checkUserRole])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      await supabase.auth.signInAnonymously()
    }
    return { error }
  }

  const value = {
    user,
    session,
    signIn,
    signOut,
    loading,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
