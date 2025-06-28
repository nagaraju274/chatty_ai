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
  photoDataUri: z
    .string()
    .nullable()
    .optional()
    .describe(
      "An optional file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type GenerateAIResponseInput = z.infer<typeof GenerateAIResponseInputSchema>;

// Define the output schema
const GenerateAIResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
  suggestions: z.array(z.string()).describe('A list of 3-4 related questions the user might want to ask next.'),
});

export type GenerateAIResponseOutput = z.infer<typeof GenerateAIResponseOutputSchema>;

// Define the prompt
const generateAIResponsePrompt = ai.definePrompt({
  name: 'generateAIResponsePrompt',
  model: 'googleai/gemini-1.5-pro-latest',
  input: {schema: GenerateAIResponseInputSchema},
  output: {schema: GenerateAIResponseOutputSchema},
  system: `You are a helpful and informative chatbot. Your role is to analyze both text prompts and any accompanying files (like images, text files, etc.) to provide comprehensive and accurate answers. If a file is provided, you MUST use it as the primary source of context for your response to the user's prompt. Answer the prompt in a way that is helpful, creative, and engaging. After your response, provide a list of 3-4 related questions the user might want to ask next.`,
  prompt: `{{#if photoDataUri}}
Based on the provided file, please answer the following question: {{prompt}}

--- Start of Uploaded File ---
{{media url=photoDataUri}}
--- End of Uploaded File ---
{{else}}
{{prompt}}
{{/if}}`,
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
    // Generate the response
    const {output} = await generateAIResponsePrompt(input);

    if (!output) {
      throw new Error("The AI failed to generate a response in the expected format.");
    }
    // Return the response
    return output;
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
