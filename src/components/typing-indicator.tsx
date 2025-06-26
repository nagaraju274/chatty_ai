"use client"

import { Bot } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-accent text-accent-foreground">
          <Bot size={20} />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-xl rounded-lg bg-card p-3 text-sm shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: '0s' }} />
          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: '0.2s' }} />
          <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}
