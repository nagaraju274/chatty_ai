"use client"

import { useState } from 'react'
import Image from "next/image"
import { Bot, User, Check, Copy, Smile, Frown, Meh } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from './ui/button'

export interface ChatMessageProps {
  message: {
    role: "user" | "assistant"
    content: string
    sentiment?: 'Positive' | 'Negative' | 'Neutral'
    attachment?: {
        name: string;
        dataUri: string;
    }
  }
}

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative my-2 font-code">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-7 w-7 text-white/80 hover:bg-white/10 hover:text-white"
        onClick={handleCopy}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </Button>
      <pre className="p-4 rounded-md bg-gray-950 dark:bg-black text-white overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function renderContent(content: string) {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const codeContentRaw = part.slice(3, -3);
            const langEndIndex = codeContentRaw.indexOf('\n');
            const code = langEndIndex !== -1 ? codeContentRaw.substring(langEndIndex + 1) : codeContentRaw;
            return <CodeBlock key={index} code={code.trim()} />;
        }
        return (
            <span key={index}>
                {part.split('\n').map((line, i, arr) => (
                    <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                    </span>
                ))}
            </span>
        );
    });
}

const SentimentIcon = ({ sentiment }: { sentiment: ChatMessageProps['message']['sentiment'] }) => {
  if (!sentiment) return null;

  switch (sentiment) {
    case 'Positive':
      return <Smile className="h-4 w-4 shrink-0" />;
    case 'Negative':
      return <Frown className="h-4 w-4 shrink-0" />;
    case 'Neutral':
      return <Meh className="h-4 w-4 shrink-0" />;
    default:
      return null;
  }
};


export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant"
  const hasContent = message.content && message.content.trim().length > 0

  return (
    <div
      className={cn(
        "flex items-start gap-4",
        !isAssistant && "flex-row-reverse"
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className={cn(isAssistant && "bg-accent text-accent-foreground")}>
          {isAssistant ? <Bot size={20} /> : <User size={20} />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-xl break-words rounded-lg shadow-sm",
          isAssistant
            ? "bg-card text-card-foreground"
            : "bg-primary text-primary-foreground",
          { "overflow-hidden": message.attachment }
        )}
      >
        {message.attachment && message.attachment.dataUri.startsWith("data:image/") && (
          <Image 
            src={message.attachment.dataUri} 
            alt={message.attachment.name} 
            width={300} 
            height={200}
            className="object-cover"
          />
        )}
        
        {hasContent && (
          <div className="flex items-center gap-2 px-4 py-2 text-sm">
            <div>{renderContent(message.content)}</div>
            {!isAssistant && <SentimentIcon sentiment={message.sentiment} />}
          </div>
        )}
      </div>
    </div>
  )
}
