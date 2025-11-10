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
  ensureUser: () => Promise<User | null>
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

  const ensureUser = useCallback(async () => {
    if (user) {
      return user
    }

    const {
      data: { session: currentSession },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (!sessionError && currentSession?.user) {
      setSession(currentSession)
      setUser(currentSession.user)
      await checkUserRole(currentSession.user)
      return currentSession.user
    }

    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('Failed to sign in anonymously:', error)
      return null
    }

    if (data.session) {
      setSession(data.session)
    }

    if (data.user) {
      setUser(data.user)
      await checkUserRole(data.user)
    }

    const anonymousUser = data.user ?? null

    if (anonymousUser) {
      if (!data.session) {
        const {
          data: { session: refreshedSession },
        } = await supabase.auth.getSession()
        if (refreshedSession) {
          setSession(refreshedSession)
        }
      }
      await checkUserRole(anonymousUser)
    }

    return anonymousUser
  }, [user, checkUserRole])

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
    if (user?.is_anonymous) {
      await supabase.auth.signOut()
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) {
      if (data.session) {
        setSession(data.session)
      }
      if (data.user) {
        setUser(data.user)
        await checkUserRole(data.user)
      }
    }

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
    ensureUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
