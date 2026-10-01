import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabase'
import type { Database } from '@/types/database'

type DbProfile = Database['public']['Tables']['profiles']['Row']

export interface AuthContextType {
  user: User | null
  session: Session | null
  profile: DbProfile | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName: string, redirectTo?: string) => Promise<{ error: AuthError | null; data: any }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<DbProfile>) => Promise<{ error: any }>
  uploadAvatar: (file: File) => Promise<{ error: any; url?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<DbProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    if (!isSupabaseConfigured) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        setProfile(data)
      } else if (!data) {
        // If profile doesn't exist yet, insert basic row
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          const u = userData.user
          const fullName = u.user_metadata?.full_name || u.user_metadata?.name || ''
          const parts = fullName.split(' ')
          const newProfile = {
            id: u.id,
            first_name: u.user_metadata?.first_name || parts[0] || '',
            last_name: u.user_metadata?.last_name || parts.slice(1).join(' ') || '',
            display_name: fullName || u.email?.split('@')[0] || 'User',
            email: u.email || null,
            avatar_url: u.user_metadata?.avatar_url || null,
          }
          await (supabase.from('profiles') as any).insert(newProfile)
          setProfile(newProfile as DbProfile)
        }
      }
    } catch (e) {
      console.error('Failed to load profile:', e)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        if (currentSession?.user) {
          await loadProfile(currentSession.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured') as unknown as AuthError }
    }
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.data.session) {
      setSession(result.data.session)
      setUser(result.data.session.user)
      await loadProfile(result.data.session.user.id)
    }
    return { error: result.error }
  }

  const signUp = async (email: string, password: string, fullName: string, redirectTo?: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured') as unknown as AuthError, data: null }
    }
    const parts = fullName.trim().split(' ')
    const firstName = parts[0] || ''
    const lastName = parts.slice(1).join(' ') || ''
    
    const emailRedirectTo = redirectTo 
      ? (redirectTo.startsWith('http') ? redirectTo : `${window.location.origin}${redirectTo}`)
      : `${window.location.origin}/signin?verified=true`

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          display_name: fullName || email.split('@')[0],
        },
      },
    })
    return { error: result.error, data: result.data }
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured') as unknown as AuthError }
    }
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    return { error: result.error }
  }

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const updateProfile = async (updates: Partial<DbProfile>) => {
    if (!user || !isSupabaseConfigured) {
      return { error: new Error('Not authenticated') }
    }
    try {
      const { data, error } = await (supabase.from('profiles') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (!error && data) {
        setProfile(data)
      }
      return { error }
    } catch (err) {
      return { error: err }
    }
  }

  const uploadAvatar = async (file: File): Promise<{ error: any; url?: string }> => {
    if (!user || !isSupabaseConfigured) {
      return { error: new Error('Not authenticated') }
    }
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        // Fallback: If avatars bucket doesn't exist, convert to base64 data URL
        const reader = new FileReader()
        return new Promise<{ error: any; url?: string }>((resolve) => {
          reader.onload = async () => {
            const dataUrl = reader.result as string
            await updateProfile({ avatar_url: dataUrl })
            resolve({ error: null, url: dataUrl })
          }
          reader.onerror = (e) => resolve({ error: e })
          reader.readAsDataURL(file)
        })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await updateProfile({ avatar_url: publicUrl })
      return { error: null, url: publicUrl }
    } catch (err) {
      return { error: err }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
        uploadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
