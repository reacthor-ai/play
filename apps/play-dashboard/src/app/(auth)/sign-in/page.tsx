'use client'

import {useState} from 'react'
import {Button} from "@/components/ui/button"
import {GithubIcon, Terminal} from "lucide-react"
import {createClientComponentClient} from '@supabase/auth-helpers-nextjs'
import type {Provider} from "@supabase/supabase-js"
import {Alert, AlertDescription, AlertTitle,} from "@/components/ui/alert"
import {getSupabaseAuthRedirectURL} from "@/utils/supabase/url";

export default function AuthenticationPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleSignIn = async (provider: Provider) => {
    try {
      setLoading(true)
      setError(null)
      const {error} = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getSupabaseAuthRedirectURL(window.location.origin),
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })
      if (error) {
        setError(error.message || 'An unexpected error occurred')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#000000] text-white">
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
          <p className="text-sm text-gray-400">Sign in to your account and compete.</p>
        </div>
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4"/>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6">
          <div className="grid gap-4">
            <Button
              variant="outline"
              onClick={() => handleSignIn('google')}
              disabled={loading}
              className="bg-white text-black hover:bg-gray-200"
            >
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSignIn('github')}
              disabled={loading}
              className="bg-white text-black hover:bg-gray-200"
            >
              <GithubIcon className="mr-2 h-4 w-4"/>
              {loading ? 'Signing in...' : 'Sign in with GitHub'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}