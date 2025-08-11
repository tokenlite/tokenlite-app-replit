# Replit.md

## Overview

This is an AI-powered litepaper generator for cryptocurrency and blockchain projects. The application enables users to create professional-grade technical documentation by inputting project details such as tokenomics, features, and market analysis. The system leverages OpenAI's GPT models to generate comprehensive litepaper content and supports multiple output formats including PDF, HTML, and Markdown.

The platform features a step-by-step form interface for collecting project information, real-time generation progress tracking, and integrated file upload capabilities for project logos. It's designed to streamline the creation of professional cryptocurrency documentation with AI assistance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: React Hook Form for form handling, TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive set of Radix UI primitives wrapped in custom components

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **Development**: Hot module replacement via Vite in development mode
- **API Design**: RESTful endpoints with structured error handling and request logging middleware

### Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle ORM
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management
- **In-Memory Storage**: Temporary storage implementation using Map-based storage for development

### File Storage & Management
- **Cloud Storage**: Google Cloud Storage integration
- **File Uploads**: Uppy.js with AWS S3 compatibility for direct uploads
- **Access Control**: Custom ACL system for object-level permissions
- **File Serving**: Direct file serving through Express with proper headers

### AI Content Generation
- **Provider**: OpenAI API integration using GPT-4o model
- **Content Types**: Executive summaries, market analysis, tokenomics explanations, technical specifications
- **Document Formats**: Support for PDF, HTML, and Markdown output formats
- **Chart Generation**: Canvas-based tokenomics visualization charts

### Authentication & Security
- **Object Access**: Custom ACL policies stored as metadata
- **Environment-based Configuration**: Secure API key management
- **CORS**: Configured for cross-origin requests in development

## External Dependencies

### Core Technologies
- **Database**: Neon Database (PostgreSQL serverless)
- **File Storage**: Google Cloud Storage with Replit sidecar authentication
- **AI Services**: OpenAI API for content generation

### Third-Party Libraries
- **UI Framework**: Radix UI primitives for accessible components
- **Form Management**: React Hook Form with Zod validation
- **File Uploads**: Uppy.js ecosystem (core, dashboard, AWS S3 adapter)
- **Data Fetching**: TanStack Query for server state management
- **Styling**: Tailwind CSS with custom design tokens
- **Charts**: Chart.js for data visualization, Canvas API for custom chart generation
- **Document Generation**: Puppeteer for PDF generation

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Database Tools**: Drizzle ORM and Drizzle Kit for schema management
- **Code Quality**: TypeScript for type safety, ESLint configuration
- **Development Experience**: Replit-specific plugins for enhanced development workflow