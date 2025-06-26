"use server"

import { generateAIResponse } from "@/ai/flows/generate-ai-response"
import { z } from "zod"

const MessageSchema = z.object({
  prompt: z.string().min(1, { message: "Message cannot be empty." }),
})

export async function submitMessage(prevState: any, formData: FormData) {
  const parsed = MessageSchema.safeParse({
    prompt: formData.get("prompt"),
  })

  if (!parsed.success) {
    const error = parsed.error.format().prompt?._errors[0]
    return { error: error || "Invalid input." }
  }

  try {
    const response = await generateAIResponse({ prompt: parsed.data.prompt })
    return { response: response.response }
  } catch (error) {
    console.error("Error generating AI response:", error)
    return { error: "Failed to get a response from the AI. Please try again." }
  }
}
