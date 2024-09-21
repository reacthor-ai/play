'use client'

import React, {memo, useCallback, useEffect, useState} from 'react';
import {RocketIcon} from "@radix-ui/react-icons";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {createClient} from "@/utils/supabase/client";
import {useCreateUserAtom} from "@/store/user/create";
import {getExternalApiCountries} from "@/api/external/countries";
import {useRouter} from "next/navigation";
import {NAVIGATION} from "@/utils/navigation/routes";

export const UserOnboarding: React.FC = memo(() => {
  const [username, setUsername] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [countries, setCountries] = useState<string[]>([]);
  const [email, setEmail] = useState<string>('');
  const [supabaseId, setSupabaseId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter()

  const supabase = createClient();

  const [{mutate: createUserAtom}] = useCreateUserAtom();

  const getCurrentUser = useCallback(async () => {
    const {data: supabaseUser, error} = await supabase.auth.getUser();

    if (error) {
      setError("Error fetching user. Please try again.");
      return;
    }

    if (supabaseUser?.user) {
      setSupabaseId(supabaseUser.user.id);
      setEmail(supabaseUser.user.email || '');
    } else {
      setError("No user found. Please log in.");
    }
  }, [supabase.auth]);

  const loadCountries = useCallback(async () => {
    try {
      const countryList = await getExternalApiCountries();
      setCountries(countryList);
    } catch (error) {
      setError("Error fetching countries. Please try again.");
    }
  }, []);

  useEffect(() => {
    getCurrentUser();
    loadCountries();
  }, [getCurrentUser, loadCountries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!supabaseId) {
      setError("No Supabase ID found. Please log in and try again.");
      setIsLoading(false);
      return;
    }

    try {
      await createUserAtom({
        onboarding: true,
        supabaseId,
        username,
        email,
        country,
      }, {
        onSettled: (data) => {
          setIsLoading(false);
          if (data && data.status === 'fulfilled') {
            return router.push(NAVIGATION.Dashboard.Games)
          }
          if (data && data.status === 'rejected') {
            setError("Failed to create user. Please try again. Username might be taken.");
          }
        }
      });
    } catch (error) {
      setIsLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const SpinnerSVG = () => (
    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="mt-2 text-gray-400">Complete your profile to get started.</p>
        </div>
        {error && (
          <Alert className="mb-4 bg-red-900 border-red-700">
            <RocketIcon className="h-4 w-4 text-red-400"/>
            <AlertTitle className="text-red-400">Error</AlertTitle>
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="country" className="text-gray-300">Country</Label>
              <Select onValueChange={setCountry} required>
                <SelectTrigger className="w-full mt-1 bg-black border-gray-700 text-gray-300">
                  <SelectValue placeholder="Select your country"/>
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  {countries.length > 0 ? (
                    countries.map((c) => (
                      <SelectItem key={c} value={c} className="text-gray-300 hover:bg-gray-800">{c}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="Loading..." disabled className="text-gray-300">Loading...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 bg-black border-gray-700 text-gray-300 placeholder-gray-500"
                placeholder="Enter your username"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-gray-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading && <SpinnerSVG/>}
            {isLoading ? 'Processing...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
});

UserOnboarding.displayName = 'UserOnboarding';

