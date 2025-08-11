import OpenAI from "openai";
import type { InsertLitepaper } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface LitepaperContent {
  executiveSummary: string;
  problemStatement: string;
  marketAnalysis: string;
  solution: string;
  productFeatures: string;
  tokenDistribution: string;
  tokenomicsUtility: string;
  emissionSchedule: string;
  tokenFlow: string;
  valueGrowth: string;
}

export async function generateLitepaperContent(data: InsertLitepaper): Promise<LitepaperContent> {
  const prompt = `
You are an expert cryptocurrency whitepaper writer. Generate comprehensive content for a professional litepaper based on the following project details:

Project Name: ${data.projectName}
Token Symbol: ${data.tokenSymbol}
Description: ${data.description}
Problem Statement: ${data.problemStatement}
Target Market: ${data.targetMarket || "Not specified"}
Market Size: ${data.marketSize || "Not specified"}
Total Supply: ${data.totalSupply}
Initial Price: ${data.initialPrice ? `$${data.initialPrice}` : "Not specified"}
Vesting Period: ${data.vestingPeriod ? `${data.vestingPeriod} months` : "Not specified"}
Token Distribution: ${JSON.stringify(data.tokenDistribution)}
Features: ${JSON.stringify(data.features)}
Content Style: ${data.contentStyle}
Document Length: ${data.documentLength}

Generate professional litepaper content with the following sections. Return the response as a JSON object with these exact keys:

1. executiveSummary - A compelling 2-3 paragraph executive summary
2. problemStatement - Detailed analysis of the problem being solved (3-4 paragraphs)
3. marketAnalysis - Market opportunity and growth potential analysis (3-4 paragraphs)
4. solution - Detailed description of the proposed solution (4-5 paragraphs)
5. productFeatures - Comprehensive overview of main product features (4-5 paragraphs)
6. tokenDistribution - Analysis of token distribution strategy (3-4 paragraphs)
7. tokenomicsUtility - Detailed explanation of token utility and mechanics (4-5 paragraphs)
8. emissionSchedule - Token emission schedule and vesting details (2-3 paragraphs)
9. tokenFlow - Token flow and ecosystem mechanics (3-4 paragraphs)
10. valueGrowth - Simulated token value growth analysis and projections (3-4 paragraphs)

Make the content professional, investor-grade, and specific to the cryptocurrency industry. Use proper technical terminology and ensure all sections flow logically. Focus on ${data.contentStyle} tone throughout.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert cryptocurrency whitepaper writer. Generate comprehensive, professional content for litepapers. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate that all required sections are present
    const requiredSections = [
      "executiveSummary", "problemStatement", "marketAnalysis", "solution",
      "productFeatures", "tokenDistribution", "tokenomicsUtility", 
      "emissionSchedule", "tokenFlow", "valueGrowth"
    ];

    for (const section of requiredSections) {
      if (!content[section]) {
        throw new Error(`Missing required section: ${section}`);
      }
    }

    return content as LitepaperContent;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate litepaper content: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}
