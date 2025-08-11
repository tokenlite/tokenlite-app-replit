import OpenAI from "openai";
import type { InsertLitepaper } from "@shared/schema";
import { generateLitepaperContent } from "./openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface ChatbotResponse {
  response: string;
  litepaper?: InsertLitepaper & { generatedContent: any };
}

export async function generateChatbotResponse(
  message: string, 
  conversationHistory: Array<{role: string; content: string}>,
  shouldGenerate: boolean
): Promise<ChatbotResponse> {
  
  // Build conversation context
  const conversationContext = conversationHistory
    .slice(-5) // Keep last 5 messages for context
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  if (shouldGenerate) {
    // Extract project details using AI
    const extractionPrompt = `
Based on this conversation about a cryptocurrency project, extract the key project details and generate a professional litepaper.

Conversation:
${conversationContext}
Current message: ${message}

Extract and infer the following details (use reasonable defaults for missing information):
1. Project name
2. Token symbol (3-4 characters)
3. Project description
4. Problem statement
5. Target market (defi, nft, infrastructure, payments, privacy, other)
6. Market size estimate
7. Total supply (as string)
8. Key features (at least 2-3)
9. Token distribution percentages (must sum to 100)

Generate a comprehensive response that acknowledges the project details and creates the litepaper. Return as JSON with this structure:
{
  "response": "Conversational response about creating the litepaper",
  "projectData": {
    "projectName": "string",
    "tokenSymbol": "string", 
    "description": "string (min 10 chars)",
    "problemStatement": "string (min 10 chars)",
    "targetMarket": "defi|nft|infrastructure|payments|privacy|other",
    "marketSize": "string",
    "totalSupply": "string",
    "features": [{"name": "string", "description": "string"}],
    "tokenDistribution": {"category": number},
    "outputFormat": "pdf"
  }
}

Make the response enthusiastic and professional. If insufficient information is provided, ask specific follow-up questions instead of generating the litepaper.
`;

    const extractionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful cryptocurrency litepaper assistant that extracts project details and generates professional documentation." },
        { role: "user", content: extractionPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(extractionResponse.choices[0].message.content || "{}");
    
    if (result.projectData && result.projectData.projectName && result.projectData.features?.length >= 1) {
      // Generate AI content for the litepaper
      const generatedContent = await generateLitepaperContent(result.projectData);
      
      return {
        response: result.response || `Great! I've created a professional litepaper for ${result.projectData.projectName}. You can download it in PDF, HTML, or Markdown format using the buttons below.`,
        litepaper: {
          ...result.projectData,
          generatedContent
        }
      };
    } else {
      return {
        response: result.response || "I need more details about your project to create a comprehensive litepaper. Could you tell me more about your token's purpose, key features, and tokenomics?"
      };
    }
  } else {
    // Generate conversational response
    const chatPrompt = `
You are a helpful AI assistant specializing in cryptocurrency litepapers and tokenomics. 

Conversation history:
${conversationContext}

Current message: ${message}

Provide a helpful, engaging response that:
1. Acknowledges their message
2. Asks relevant follow-up questions about their crypto project
3. Guides them toward providing enough detail for litepaper generation
4. Mentions that you can generate a litepaper once you have sufficient project details

Keep the tone professional but friendly. Focus on gathering information about:
- Project purpose and problem it solves
- Target market and use cases
- Token utility and distribution
- Key features or innovations
`;

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a cryptocurrency litepaper specialist assistant." },
        { role: "user", content: chatPrompt }
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    return {
      response: chatResponse.choices[0].message.content || "Tell me more about your cryptocurrency project and I'll help you create a professional litepaper!"
    };
  }
}