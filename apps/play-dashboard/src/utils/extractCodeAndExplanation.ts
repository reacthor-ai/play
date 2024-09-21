export function extractCodeAndExplanation(text: string): {
  code: string | null,
  explanation: string | null,
  originalText: string
} {
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        code: typeof parsed.code === 'string' ? parsed.code : null,
        explanation: typeof parsed.explanation === 'string' ? parsed.explanation : null,
        originalText: text
      };
    }
  } catch (e) {}

  return {code: null, explanation: null, originalText: text};
}