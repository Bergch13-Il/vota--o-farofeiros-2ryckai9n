import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { getUserRole } from '@/services/users'
import { UserRole } from '@/types'

interface AuthContextType {
  user: User | null
  session: Session | null
  role: UserRole
  isAdmin: boolean
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
  const [role, setRole] = useState<UserRole>('user')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async (currentUser: User | null) => {
      if (currentUser) {
        const userRole = await getUserRole(currentUser.id)
        setRole(userRole || 'user')
      } else {
        setRole('user')
      }
      setLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      fetchRole(currentUser)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      fetchRole(currentUser)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    session,
    role,
    isAdmin: role === 'admin',
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
