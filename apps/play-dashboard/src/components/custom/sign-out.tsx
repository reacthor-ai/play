'use client'

import {useState} from 'react';
import {Button} from "@/components/ui/button";
import {LogOut} from "lucide-react";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useRouter} from 'next/navigation';
import {Alert, AlertDescription} from '@/components/ui/alert';

export const SignOut = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    setLoading(true);
    setError('');
    try {
      const {error} = await supabase.auth.signOut();
      if (error) {
        setError(error.message || 'An unexpected error occurred')
      }
      router.push('/sign-in');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="">
      <Button
        variant="destructive"
        className=""
        onClick={handleSignOut}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing Out...
          </>
        ) : (
          <>
            <LogOut className="mr-2 h-4 w-4"/> Log Out
          </>
        )}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}