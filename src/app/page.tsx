"use client"

import {
  useState,
  useRef,
  useEffect,
  useActionState,
  useMemo,
} from "react"
import { useFormStatus } from "react-dom"
import { ArrowUp, Settings, PlusCircle } from "lucide-react"

import { submitMessage } from "@/app/actions"
import { ChatMessage, type ChatMessageProps } from "@/components/chat-message"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { TypingIndicator } from "@/components/typing-indicator"

type Message = ChatMessageProps["message"]

interface Conversation {
  id: string
  title: string
  messages: Message[]
}

const initialState: {
  response?: string
  error?: string
  suggestions?: string[]
} = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      size="icon"
      disabled={pending}
      className="absolute bottom-2.5 right-2.5 h-8 w-8"
      aria-label="Send message"
    >
      {pending ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
      ) : (
        <ArrowUp size={18} />
      )}
    </Button>
  )
}

interface PageContentProps {
  messages: Message[]
  suggestions: string[]
  handleSuggestionClick: (suggestion: string) => void
  formRef: React.RefObject<HTMLFormElement>
}

function PageContent({
  messages,
  suggestions,
  handleSuggestionClick,
  formRef,
}: PageContentProps) {
  const { pending } = useFormStatus()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!pending) {
      formRef.current?.reset()
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto"
      }
    }
  }, [pending, formRef])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, suggestions, pending])

  const handleTextareaInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget
    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <Logo className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Chatty</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">Theme</p>
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="container mx-auto max-w-3xl space-y-6 p-4 md:p-6">
            {messages.length === 0 ? (
              <Card className="mx-auto mt-10 max-w-md">
                <CardContent className="p-6 text-center">
                  <Logo className="mx-auto h-12 w-12 text-primary" />
                  <h2 className="mt-4 text-2xl font-semibold">
                    Welcome to Chatty
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Start a conversation by typing a message below, or start a
                    new chat.
                  </p>
                </CardContent>
              </Card>
            ) : (
              messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))
            )}
            {pending && <TypingIndicator />}
            {!pending && suggestions.length > 0 && (
              <div className="flex flex-wrap items-center justify-start gap-2 pl-12">
                {suggestions.map((s, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleSuggestionClick(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="border-t bg-card">
        <div className="container mx-auto max-w-3xl p-4">
          <div className="relative">
            <Textarea
              ref={textAreaRef}
              name="prompt"
              placeholder="Message Chatty..."
              className="min-h-[44px] max-h-48 resize-none pr-14"
              onInput={handleTextareaInput}
              onKeyDown={handleKeyDown}
              disabled={pending}
            />
            <SubmitButton />
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [formState, formAction] = useActionState(submitMessage, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const storedHistory = localStorage.getItem("chatHistory")
    if (storedHistory) {
      setConversations(JSON.parse(storedHistory))
    }
  }, [])

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(conversations))
    }
  }, [conversations])

  const handleNewChat = () => {
    setActiveConversationId(null)
    setSuggestions([])
    formRef.current?.reset()
  }

  const clientAction = (formData: FormData) => {
    const prompt = formData.get("prompt") as string
    if (!prompt.trim()) {
      return
    }

    setSuggestions([])
    let conversationId = activeConversationId
    
    if (conversationId === null) {
      conversationId = Date.now().toString()
      const newConversation: Conversation = {
        id: conversationId,
        title: prompt.substring(0, 40) + (prompt.length > 40 ? "..." : ""),
        messages: [{ role: "user", content: prompt }],
      }
      setConversations(prev => [newConversation, ...prev])
      setActiveConversationId(conversationId)
    } else {
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, { role: "user", content: prompt }] }
            : c
        )
      )
    }

    formAction(formData)
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (formRef.current) {
      const promptTextarea = formRef.current.elements.namedItem(
        "prompt"
      ) as HTMLTextAreaElement | null
      if (promptTextarea) {
        promptTextarea.value = suggestion
        formRef.current.requestSubmit()
      }
    }
  }

  useEffect(() => {
    if (!formState.response && !formState.error) return
    if (!activeConversationId) return

    if (formState.response) {
      setConversations(prev => {
        return prev.map(c => {
          if (c.id === activeConversationId) {
            const lastMessage = c.messages[c.messages.length - 1]
            if (lastMessage?.role === "user") {
              return { ...c, messages: [...c.messages, { role: "assistant", content: formState.response! }] }
            }
          }
          return c
        })
      })
    }
    
    if (formState.error) {
      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConversationId) {
            const lastMessage = c.messages[c.messages.length - 1]
            if (lastMessage?.role === "user") {
              return { ...c, messages: c.messages.slice(0, -1) }
            }
          }
          return c
        })
      )
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: formState.error,
      })
    }

    if (formState.suggestions) {
      setSuggestions(formState.suggestions)
    } else if (formState.response || formState.error) {
      setSuggestions([])
    }
  }, [formState, activeConversationId, toast])
  
  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeConversationId),
    [conversations, activeConversationId]
  )

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleNewChat}>
            <PlusCircle />
            New Chat
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {conversations.map(convo => (
              <SidebarMenuItem key={convo.id}>
                <SidebarMenuButton
                  onClick={() => setActiveConversationId(convo.id)}
                  isActive={activeConversationId === convo.id}
                  className="w-full"
                >
                  <span className="truncate">{convo.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <form ref={formRef} action={clientAction}>
          <PageContent
            messages={activeConversation?.messages ?? []}
            suggestions={suggestions}
            handleSuggestionClick={handleSuggestionClick}
            formRef={formRef}
          />
        </form>
      </SidebarInset>
    </SidebarProvider>
  )
}
