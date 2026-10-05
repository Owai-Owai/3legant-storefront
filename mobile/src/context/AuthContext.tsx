import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { supabase } from '../lib/supabase'

WebBrowser.maybeCompleteAuthSession()

export const OAUTH_REDIRECT_URL = 'https://3legant-storefront.vercel.app/auth-callback.html'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    metadata?: { firstName?: string; lastName?: string; displayName?: string }
  ) => Promise<{ error: Error | null; user: User | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, user: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Get initial session from AsyncStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Listen for auth changes (sign in, sign out, token refresh, OAuth)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 3. Deep link handler for mobile callback (e.g. 3legant://auth/callback)
    const handleDeepLink = async (event: { url: string }) => {
      const urlStr = event.url
      if (!urlStr || (!urlStr.includes('access_token') && !urlStr.includes('code'))) return

      const queryIdx = urlStr.indexOf('?')
      const hashIdx = urlStr.indexOf('#')

      let queryStr = ''
      let hashStr = ''

      if (queryIdx !== -1) {
        queryStr = urlStr.substring(
          queryIdx + 1,
          hashIdx !== -1 && hashIdx > queryIdx ? hashIdx : undefined
        )
      }
      if (hashIdx !== -1) {
        hashStr = urlStr.substring(hashIdx + 1)
      }

      const queryParams = new URLSearchParams(queryStr)
      const hashParams = new URLSearchParams(hashStr)

      const accessToken = queryParams.get('access_token') || hashParams.get('access_token')
      const refreshToken = queryParams.get('refresh_token') || hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { data: sessionData } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (sessionData.session) {
          setSession(sessionData.session)
          setUser(sessionData.session.user)
        }
      } else {
        const code = queryParams.get('code') || hashParams.get('code')
        if (code) {
          const { data: exchangeData } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeData.session) {
            setSession(exchangeData.session)
            setUser(exchangeData.session.user)
          }
        }
      }
    }

    const linkingSub = Linking.addEventListener('url', handleDeepLink)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url })
    })

    return () => {
      subscription.unsubscribe()
      linkingSub.remove()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    return { error: error as Error | null }
  }

  const signUp = async (
    email: string,
    password: string,
    metadata?: { firstName?: string; lastName?: string; displayName?: string }
  ) => {
    const fullName = metadata?.displayName || `${metadata?.firstName || ''} ${metadata?.lastName || ''}`.trim()
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          first_name: metadata?.firstName || '',
          last_name: metadata?.lastName || '',
          display_name: fullName,
          full_name: fullName,
        },
      },
    })
    return { error: error as Error | null, user: data.user }
  }

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      const mobileReturnUrl = Linking.createURL('auth/callback')
      const redirectUrl = `https://3legant-storefront.vercel.app/auth-callback.html?app_redirect=${encodeURIComponent(
        mobileReturnUrl
      )}`
      console.log('[AuthContext] Initiating Google OAuth via bridge:', redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      })

      if (error) return { error: error as Error }
      if (!data?.url) return { error: new Error('Failed to retrieve authentication URL') }

      const authSessionResult = await WebBrowser.openAuthSessionAsync(data.url, mobileReturnUrl)

      if (authSessionResult.type === 'success' && authSessionResult.url) {
        const urlStr = authSessionResult.url
        console.log('[AuthContext] Returned redirect URL:', urlStr)

        const queryIdx = urlStr.indexOf('?')
        const hashIdx = urlStr.indexOf('#')

        let queryStr = ''
        let hashStr = ''

        if (queryIdx !== -1) {
          queryStr = urlStr.substring(
            queryIdx + 1,
            hashIdx !== -1 && hashIdx > queryIdx ? hashIdx : undefined
          )
        }
        if (hashIdx !== -1) {
          hashStr = urlStr.substring(hashIdx + 1)
        }

        const queryParams = new URLSearchParams(queryStr)
        const hashParams = new URLSearchParams(hashStr)

        const accessToken = queryParams.get('access_token') || hashParams.get('access_token')
        const refreshToken = queryParams.get('refresh_token') || hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (sessionError) return { error: sessionError as Error }
          if (sessionData.session) {
            setSession(sessionData.session)
            setUser(sessionData.session.user)
          }
          return { error: null }
        }

        const code = params.get('code')
        if (code) {
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) return { error: exchangeError as Error }
          if (exchangeData.session) {
            setSession(exchangeData.session)
            setUser(exchangeData.session.user)
          }
          return { error: null }
        }
      }

      return { error: null }
    } catch (err: any) {
      console.warn('[AuthContext] Google sign in error:', err)
      return { error: err as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
