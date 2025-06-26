// This is a Genkit flow that filters inappropriate content from user input.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterInappropriateContentInputSchema = z.object({
  text: z.string().describe('The text to filter for inappropriate content.'),
});
export type FilterInappropriateContentInput = z.infer<typeof FilterInappropriateContentInputSchema>;

const FilterInappropriateContentOutputSchema = z.object({
  isAppropriate: z.boolean().describe('Whether the content is appropriate or not.'),
  filteredText: z.string().describe('The filtered text, or the original text if no filtering was needed.'),
});
export type FilterInappropriateContentOutput = z.infer<typeof FilterInappropriateContentOutputSchema>;

export async function filterInappropriateContent(
  input: FilterInappropriateContentInput
): Promise<FilterInappropriateContentOutput> {
  return filterInappropriateContentFlow(input);
}

const filterInappropriateContentPrompt = ai.definePrompt({
  name: 'filterInappropriateContentPrompt',
  input: {schema: FilterInappropriateContentInputSchema},
  output: {schema: FilterInappropriateContentOutputSchema},
  prompt: `You are a content filter that determines if the provided text is appropriate for a public audience.

  Analyze the following text:
  {{text}}

  Determine if the text contains any inappropriate content, such as hate speech, sexually explicit material, harassment, or dangerous content.

  If the text is appropriate, return isAppropriate as true and filteredText the same as the input.
  If the text is inappropriate, return isAppropriate as false, and filter the text to remove the inappropriate content and return the filtered content in filteredText. If the text cannot be filtered, indicate that it should be blocked.
  `,
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

const filterInappropriateContentFlow = ai.defineFlow(
  {
    name: 'filterInappropriateContentFlow',
    inputSchema: FilterInappropriateContentInputSchema,
    outputSchema: FilterInappropriateContentOutputSchema,
  },
  async input => {
    const {output} = await filterInappropriateContentPrompt(input);
    if (!output) {
      throw new Error("The content filter AI failed to generate a response.");
    }
    return output;
  }
);
