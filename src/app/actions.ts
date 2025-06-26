"use server"

import { generateAIResponse } from "@/ai/flows/generate-ai-response"
import { analyzeSentiment } from "@/ai/flows/sentiment-analysis-flow"
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
    const [aiResponse, sentimentResponse] = await Promise.all([
      generateAIResponse({ prompt: parsed.data.prompt }),
      analyzeSentiment({ text: parsed.data.prompt }),
    ])

    return {
      response: aiResponse.response,
      suggestions: aiResponse.suggestions,
      sentiment: sentimentResponse.sentiment,
    }
  } catch (error) {
    console.error("Error processing message:", error)
    return { error: "Failed to get a response from the AI. Please try again." }
  }
}
