import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLitepaperSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService } from "./objectStorage";
import { generateLitepaperContent } from "./services/openai";
import { generateDocument } from "./services/documentGenerator";
import { generateChatbotResponse } from "./services/chatbot";
import { isLocal, LocalObjectStorageService } from "./localConfig";

export async function registerRoutes(app: Express): Promise<Server> {
  // Use local mock service when running locally, real service on Replit
  const objectStorageService = isLocal ? new LocalObjectStorageService() : new ObjectStorageService();
  // Get upload URL for logo images
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Set logo image ACL policy after upload
  app.put("/api/logo-images", async (req, res) => {
    if (!req.body.logoImageURL) {
      return res.status(400).json({ error: "logoImageURL is required" });
    }

    try {
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.logoImageURL,
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting logo image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve uploaded objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      res.sendStatus(404);
    }
  });

  // Generate litepaper content and document
  app.post("/api/litepapers/generate", async (req, res) => {
    try {
      console.log("Generate endpoint hit with data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertLitepaperSchema.parse(req.body);
      console.log("Data validation passed");
      
      // Generate AI content
      const generatedContent = await generateLitepaperContent(validatedData);
      
      // Create litepaper record
      const litepaper = await storage.createLitepaper({
        ...validatedData,
        generatedContent,
        status: "completed"
      });

      // Generate documents in available formats
      const documents: any = {
        html: await generateDocument(litepaper, "html"),
        markdown: await generateDocument(litepaper, "markdown")
      };

      // Try to generate PDF, but don't fail the entire request if it fails
      try {
        documents.pdf = await generateDocument(litepaper, "pdf");
      } catch (pdfError: any) {
        console.warn("PDF generation failed, continuing without PDF:", pdfError?.message || pdfError);
        documents.pdf = null;
      }

      res.json({
        litepaper,
        documents,
        message: "Litepaper generated successfully"
      });
    } catch (error) {
      console.error("Error generating litepaper:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : "Internal server error" 
        });
      }
    }
  });

  // Create new litepaper
  app.post("/api/litepapers", async (req, res) => {
    try {
      const validatedData = insertLitepaperSchema.parse(req.body);
      
      // Generate AI content
      const generatedContent = await generateLitepaperContent(validatedData);
      
      // Create litepaper record
      const litepaper = await storage.createLitepaper({
        ...validatedData,
        generatedContent,
        status: "completed"
      });

      res.json(litepaper);
    } catch (error) {
      console.error("Error creating litepaper:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : "Internal server error" 
        });
      }
    }
  });

  // Get recent litepapers
  app.get("/api/litepapers/recent", async (req, res) => {
    try {
      const recentLitepapers = await storage.getRecentLitepapers(5);
      res.json(recentLitepapers);
    } catch (error) {
      console.error("Error fetching recent litepapers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chatbot message endpoint
  app.post("/api/chatbot/message", async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      // Check if the user wants to generate a litepaper
      const shouldGenerate = message.toLowerCase().includes('generate') || 
                            message.toLowerCase().includes('create') ||
                            message.toLowerCase().includes('litepaper') ||
                            conversationHistory.length >= 2; // After some conversation

      // Generate AI response
      const aiResponse = await generateChatbotResponse(message, conversationHistory, shouldGenerate);
      
      if (aiResponse.litepaper) {
        // Store the generated litepaper
        const storedLitepaper = await storage.createLitepaper({
          ...aiResponse.litepaper,
          status: "completed"
        });

        // Generate documents
        const documents: any = {
          html: await generateDocument(storedLitepaper, "html"),
          markdown: await generateDocument(storedLitepaper, "markdown")
        };

        try {
          documents.pdf = await generateDocument(storedLitepaper, "pdf");
        } catch (pdfError: any) {
          console.warn("PDF generation failed in chatbot:", pdfError?.message);
          documents.pdf = null;
        }

        return res.json({
          response: aiResponse.response,
          litepaper: {
            id: storedLitepaper.id,
            projectName: storedLitepaper.projectName,
            documents
          }
        });
      }

      res.json({ response: aiResponse.response });
    } catch (error) {
      console.error("Error in chatbot:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Internal server error",
        response: "I apologize, but I'm having trouble processing your request. Could you please describe your project again?"
      });
    }
  });

  // Download litepaper in specified format
  app.get("/api/litepapers/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const { format = "pdf" } = req.query;

      const litepaper = await storage.getLitepaper(id);
      if (!litepaper) {
        return res.status(404).json({ error: "Litepaper not found" });
      }

      if (!litepaper.generatedContent) {
        return res.status(400).json({ error: "Litepaper content not generated yet" });
      }

      const document = await generateDocument(litepaper, format as string);
      
      const contentTypes = {
        pdf: "application/pdf",
        html: "text/html",
        markdown: "text/markdown"
      };

      const extensions = {
        pdf: "pdf",
        html: "html", 
        markdown: "md"
      };

      res.setHeader("Content-Type", contentTypes[format as keyof typeof contentTypes] || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${litepaper.projectName}-litepaper.${extensions[format as keyof typeof extensions]}"`);
      
      if (format === "pdf") {
        res.send(Buffer.from(document, 'base64'));
      } else {
        res.send(document);
      }
    } catch (error) {
      console.error("Error downloading litepaper:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
