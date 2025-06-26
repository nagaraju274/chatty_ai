'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating AI responses to user prompts.
 *
 * The flow takes a user prompt as input and returns an AI-generated response.
 * It also includes content filtering to ensure the response is appropriate and safe.
 *
 * @exports generateAIResponse - An async function that takes a prompt and returns an AI-generated response.
 * @exports GenerateAIResponseInput - The input type for the generateAIResponse function.
 * @exports GenerateAIResponseOutput - The return type for the generateAIResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const GenerateAIResponseInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate a response for.'),
});

export type GenerateAIResponseInput = z.infer<typeof GenerateAIResponseInputSchema>;

// Define the output schema
const GenerateAIResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
  suggestions: z.array(z.string()).describe('A list of 3-4 related questions the user might want to ask next.'),
});

export type GenerateAIResponseOutput = z.infer<typeof GenerateAIResponseOutputSchema>;

// Define the tool for content filtering
const filterContent = ai.defineTool({
  name: 'filterContent',
  description: 'Identifies and filters inappropriate or harmful content in user input.',
  inputSchema: z.object({
    text: z.string().describe('The text to filter.'),
  }),
  outputSchema: z.boolean().describe('True if the content is safe, false otherwise.'),
},
async (input) => {
  // Placeholder implementation for content filtering.
  // Replace this with your actual content filtering logic.
  // This is a stub that always returns true.  Real code should inspect `input.text`.
  return true;
});

// Define the prompt
const generateAIResponsePrompt = ai.definePrompt({
  name: 'generateAIResponsePrompt',
  input: {schema: GenerateAIResponseInputSchema},
  output: {schema: GenerateAIResponseOutputSchema},
  tools: [filterContent],
  system: `You are a helpful and informative chatbot.  If the user's question contains potentially harmful content, use the filterContent tool to check the prompt.
Answer the prompt in a way that is helpful, creative, and engaging. After your response, provide a list of 3-4 related questions the user might want to ask next.`,
  prompt: `{{prompt}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});


// Define the flow
const generateAIResponseFlow = ai.defineFlow(
  {
    name: 'generateAIResponseFlow',
    inputSchema: GenerateAIResponseInputSchema,
    outputSchema: GenerateAIResponseOutputSchema,
  },
  async input => {
    // Use the content filter tool
    const isSafe = await filterContent({text: input.prompt});

    if (!isSafe) {
      return {
        response: 'I am sorry, I cannot respond to prompts containing potentially harmful content.',
        suggestions: [],
      };
    }

    // Generate the response
    const {output} = await generateAIResponsePrompt(input);

    // Return the response
    return output!;
  }
);

/**
 * Generates an AI response to the given prompt.
 * @param input The input object containing the prompt.
 * @returns The output object containing the AI-generated response.
 */
export async function generateAIResponse(input: GenerateAIResponseInput): Promise<GenerateAIResponseOutput> {
  return generateAIResponseFlow(input);
}
