'use client'

import {useCallback, useEffect, useState} from 'react'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {getExternalApiCountries} from "@/api/external/countries";


export default function OnboardingPage() {
  const [username, setUsername] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [countries, setCountries] = useState<string[]>([]);

  const loadCountries = useCallback(async () => {
    try {
      const countryList = await getExternalApiCountries();
      setCountries(countryList);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  }, []);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitted:', {username, country})
    // Handle form submission here
  }
  console.log("coutries", countries)
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="mt-2 text-gray-400">Complete your profile to get started.</p>
        </div>
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
          <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200">
            Complete Profile
          </Button>
        </form>
      </div>
    </div>
  )
}