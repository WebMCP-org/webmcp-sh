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

/**
 * Estimate tokens using a simpler heuristic (fallback method)
 * Rule of thumb: 1 token ≈ 4 characters, 1 token ≈ ¾ of a word
 *
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Average between character-based and word-based estimation
  const charEstimate = Math.ceil(text.length / 4);
  const wordEstimate = Math.ceil(text.split(/\s+/).length / 0.75);

  return Math.round((charEstimate + wordEstimate) / 2);
}
