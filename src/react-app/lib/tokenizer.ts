import { encode } from 'gpt-tokenizer';

/**
 * Calculate the number of tokens for a given text using GPT tokenizer
 * This provides accurate token counts compatible with OpenAI models
 *
 * @param text - The text to tokenize
 * @returns The number of tokens
 */
export function countTokens(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  try {
    const tokens = encode(text);
    return tokens.length;
  } catch (error) {
    console.error('Error counting tokens:', error);
    // Fallback to rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}
