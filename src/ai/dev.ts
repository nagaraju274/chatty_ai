import { config } from 'dotenv';
config();

import '@/ai/flows/generate-ai-response.ts';
import '@/ai/flows/filter-inappropriate-content.ts';
import '@/ai/flows/sentiment-analysis-flow.ts';
