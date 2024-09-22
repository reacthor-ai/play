import React from 'react';
import {useOnlineUsers} from './useOnlineUsers';
import {Avatar, AvatarFallback,} from "@/components/ui/avatar"
import {User} from "@thor/db";

const getInitials = (name?: string) => {
  if (!name) return
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getRandomColor = (name?: string) => {
  if (!name) return
  let hash = 0;
  for (let i = 0; i < name?.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

export const Onlinethoreans: React.FC<{user: User}> = ({ user }) => {
  const onlineUsers = useOnlineUsers(user);

  return (
    <div className="p-4">

      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-sm font-bold">online</h2>
        {onlineUsers.map((user) => (
          <div key={user.id} className="flex items-center">
            <Avatar className='w-6 h-6'>
              <AvatarFallback className='text-sm' style={{backgroundColor: getRandomColor(user.username)}}>
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
          </div>
        ))}
      </div>
    </div>
  );
};

