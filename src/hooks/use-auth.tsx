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
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
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
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkUserRole = useCallback(async (userToCheck: User | null) => {
    if (userToCheck && !userToCheck.is_anonymous) {
      const role = await getUserRole(userToCheck.id)
      setIsAdmin(role === 'admin')
    } else {
      setIsAdmin(false)
    }
  }, [])

  useEffect(() => {
    const handleAuthChange = async (event: string, session: Session | null) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await checkUserRole(currentUser)

      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'SIGNED_OUT'
      ) {
        setLoading(false)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange)

    const establishSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        await handleAuthChange('INITIAL_SESSION', session)
      } else {
        const { data: anonData, error } =
          await supabase.auth.signInAnonymously()
        if (error) {
          console.error('Error signing in anonymously:', error)
          setLoading(false)
        } else {
          await handleAuthChange('INITIAL_SESSION', anonData.session)
        }
      }
    }

    establishSession()

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
    isAdmin,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
