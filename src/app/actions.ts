"use server"

import { generateAIResponse } from "@/ai/flows/generate-ai-response"
import { analyzeSentiment } from "@/ai/flows/sentiment-analysis-flow"
import { z } from "zod"

const MessageSchema = z.object({
  prompt: z.string(),
  photoDataUri: z.string().optional(),
})

export async function submitMessage(prevState: any, formData: FormData) {
  const parsed = MessageSchema.safeParse({
    prompt: formData.get("prompt"),
    photoDataUri: formData.get("photoDataUri"),
  })

  if (!parsed.success) {
    const error = parsed.error.format().prompt?._errors[0]
    return { error: error || "Invalid input." }
  }

  if (!parsed.data.prompt.trim() && !parsed.data.photoDataUri) {
    return { error: "Please enter a message or upload a file." }
  }

  try {
    const aiResponsePromise = generateAIResponse({
      prompt: parsed.data.prompt,
      photoDataUri: parsed.data.photoDataUri,
    })

    const sentimentResponsePromise = parsed.data.prompt.trim()
      ? analyzeSentiment({ text: parsed.data.prompt })
      : Promise.resolve({ sentiment: "Neutral" as const })

    const [aiResponse, sentimentResponse] = await Promise.all([
      aiResponsePromise,
      sentimentResponsePromise,
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
