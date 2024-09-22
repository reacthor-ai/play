'use client'

import { useEffect, useState, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import {createClient} from "@/utils/supabase/client";
import { User } from '@thor/db'

export function useOnlineUsers(user: User) {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const supabase = createClient()

  const updateOnlineUsers = useCallback((newState: Record<string, User[]>) => {
    const presentUsers = Object.values(newState).flat()
    setOnlineUsers(prevUsers => {
      if (JSON.stringify(prevUsers) !== JSON.stringify(presentUsers)) {
        return presentUsers
      }
      return prevUsers
    })
  }, [])

  useEffect(() => {
    let channel: RealtimeChannel

    async function setupPresence() {
      channel = supabase.channel('online-users')

      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState()
          updateOnlineUsers(newState as any)
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user.id,
              username: user.username
            })
          }
        })
    }

    setupPresence()

    return () => {
      channel?.unsubscribe()
    }
  }, [updateOnlineUsers])

  return onlineUsers
}