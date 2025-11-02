import Groq from 'groq-sdk';

// Lazy initialize Groq client to ensure env vars are loaded
let groq: Groq | null = null;

function getGroqClient(): Groq {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is missing or empty. Please set it in your .env file.');
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

export interface AIResponse {
  answer: string;
  model: string;
  tokensUsed: number;
}

/**
 * Generates an answer to a question based on scraped website content using Groq AI
 * @param question - The user's question
 * @param scrapedContent - The content scraped from the website
 * @param websiteTitle - The title of the website
 * @param websiteUrl - The URL of the website
 * @returns AI-generated answer with metadata
 */
export async function generateAnswer(
  question: string,
  scrapedContent: string,
  websiteTitle: string,
  websiteUrl: string
): Promise<AIResponse> {
  console.log(`🤖 Generating AI answer for question: "${question.substring(0, 100)}..."`);

  // Truncate content if too long (Groq has token limits)
  const maxContentLength = 15000; // ~3750 tokens (rough estimate: 4 chars per token)
  const truncatedContent = scrapedContent.length > maxContentLength 
    ? scrapedContent.substring(0, maxContentLength) + '...[content truncated]'
    : scrapedContent;

  const systemPrompt = `You are a helpful AI assistant that answers questions based on website content. 
You will be provided with content scraped from a website and a question about it. 
Your job is to:
1. Carefully analyze the provided content
2. Answer the question accurately based ONLY on the information available in the content
3. If the content doesn't contain enough information to answer the question, say so clearly
4. Be concise but informative
5. Use a friendly, conversational tone

Website: ${websiteTitle}
URL: ${websiteUrl}`;

  const userPrompt = `Based on the following website content, please answer this question:

Question: ${question}

Website Content:
${truncatedContent}

Please provide a clear, accurate answer based on the content above.`;

  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile', // Fast and capable model
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const answer = completion.choices[0]?.message?.content || 'No answer generated';
    const tokensUsed = completion.usage?.total_tokens || 0;

    console.log(`✅ AI answer generated (${tokensUsed} tokens used)`);

    return {
      answer,
      model: completion.model,
      tokensUsed,
    };
  } catch (error) {
    console.error('❌ Error generating AI answer:', error);
    
    if (error instanceof Error) {
      // Handle specific Groq errors
      if (error.message.includes('API key')) {
        throw new Error('Groq API key is missing or invalid. Please set GROQ_API_KEY environment variable.');
      }
      throw new Error(`Failed to generate AI answer: ${error.message}`);
    }
    
    throw new Error('Failed to generate AI answer: Unknown error');
  }
}
