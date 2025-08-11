import puppeteer from 'puppeteer';
import type { Litepaper } from "@shared/schema";
import { generateTokenomicsChart } from "./chartGenerator";

export async function generateDocument(litepaper: Litepaper, format: string): Promise<string> {
  const content = litepaper.generatedContent;
  
  if (format === "markdown") {
    return generateMarkdown(litepaper, content);
  } else if (format === "html") {
    return generateHTML(litepaper, content);
  } else if (format === "pdf") {
    return generatePDF(litepaper, content);
  } else {
    throw new Error("Unsupported format");
  }
}

function generateMarkdown(litepaper: Litepaper, content: any): string {
  return `
# ${litepaper.projectName} Litepaper

**Token Symbol:** ${litepaper.tokenSymbol}  
**Version:** 1.0  
**Date:** ${new Date().toLocaleDateString()}

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Market Analysis](#market-analysis)
4. [Proposed Solution](#proposed-solution)
5. [Product Features](#product-features)
6. [Token Distribution](#token-distribution)
7. [Tokenomics Utility](#tokenomics-utility)
8. [Emission Schedule](#emission-schedule)
9. [Token Flow](#token-flow)
10. [Value Growth Projections](#value-growth-projections)

---

## Executive Summary

${content.executiveSummary}

## Problem Statement

${content.problemStatement}

## Market Analysis

${content.marketAnalysis}

## Proposed Solution

${content.solution}

## Product Features

${content.productFeatures}

## Token Distribution

${content.tokenDistribution}

### Distribution Breakdown

${Object.entries(litepaper.tokenDistribution as Record<string, number>).map(([key, value]) => 
  `- **${key.replace(/([A-Z])/g, ' $1').trim()}:** ${value}%`
).join('\n')}

## Tokenomics Utility

${content.tokenomicsUtility}

## Emission Schedule

${content.emissionSchedule}

## Token Flow

${content.tokenFlow}

## Value Growth Projections

${content.valueGrowth}

---

*This litepaper was generated using AI technology and should be reviewed by legal and financial experts before use.*
`;
}

function generateHTML(litepaper: Litepaper, content: any): string {
  const chartDataUrl = generateTokenomicsChart(litepaper.tokenDistribution as Record<string, number>, litepaper.tokenSymbol);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${litepaper.projectName} Litepaper</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .cover {
            text-align: center;
            padding: 60px 0;
            border-bottom: 3px solid #3b82f6;
            margin-bottom: 40px;
        }
        .cover h1 {
            font-size: 3em;
            margin: 0;
            color: #1d4ed8;
        }
        .cover h2 {
            font-size: 1.5em;
            color: #6366f1;
            margin: 10px 0;
        }
        .cover .meta {
            margin-top: 30px;
            color: #666;
        }
        .toc {
            background: #f8fafc;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 40px;
        }
        .toc h2 {
            color: #1d4ed8;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
        }
        .toc ul {
            list-style: none;
            padding: 0;
        }
        .toc li {
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .toc a {
            text-decoration: none;
            color: #3b82f6;
        }
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #1d4ed8;
            border-left: 4px solid #3b82f6;
            padding-left: 20px;
            margin-bottom: 20px;
        }
        .token-distribution {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .distribution-item {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .chart-container {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #666;
            font-style: italic;
        }
        @media print {
            .cover { page-break-after: always; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="cover">
        <h1>${litepaper.projectName}</h1>
        <h2>Litepaper</h2>
        <div class="meta">
            <p><strong>Token Symbol:</strong> ${litepaper.tokenSymbol}</p>
            <p><strong>Version:</strong> 1.0</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
    </div>

    <div class="toc">
        <h2>Table of Contents</h2>
        <ul>
            <li><a href="#executive-summary">1. Executive Summary</a></li>
            <li><a href="#problem-statement">2. Problem Statement</a></li>
            <li><a href="#market-analysis">3. Market Analysis</a></li>
            <li><a href="#solution">4. Proposed Solution</a></li>
            <li><a href="#features">5. Product Features</a></li>
            <li><a href="#distribution">6. Token Distribution</a></li>
            <li><a href="#utility">7. Tokenomics Utility</a></li>
            <li><a href="#emission">8. Emission Schedule</a></li>
            <li><a href="#flow">9. Token Flow</a></li>
            <li><a href="#growth">10. Value Growth Projections</a></li>
        </ul>
    </div>

    <div class="section" id="executive-summary">
        <h2>1. Executive Summary</h2>
        <p>${content.executiveSummary.replace(/\n/g, '</p><p>')}</p>
    </div>

    <div class="section" id="problem-statement">
        <h2>2. Problem Statement</h2>
        <p>${content.problemStatement.replace(/\n/g, '</p><p>')}</p>
    </div>

    <div class="section" id="market-analysis">
        <h2>3. Market Analysis</h2>
        <p>${content.marketAnalysis.replace(/\n/g, '</p><p>')}</p>
    </div>

    <div class="section" id="solution">
        <h2>4. Proposed Solution</h2>
        <p>${content.solution.replace(/\n/g, '</p><p>')}</p>
    </div>

    <div class="section" id="features">
        <h2>5. Product Features</h2>
        <p>${content.productFeatures.replace(/\n/g, '</p><p>')}</p>
        
        <h3>Key Features:</h3>
        <ul>
            ${(litepaper.features as any[]).map((feature: any) => `
                <li><strong>${feature.name}:</strong> ${feature.description}</li>
            `).join('')}
        </ul>
    </div>

    <div class="section" id="distribution">
        <h2>6. Token Distribution</h2>
        <p>${content.tokenDistribution.replace(/\n/g, '</p><p>')}</p>
        
        <div class="chart-container">
            <img src="${chartDataUrl}" alt="Token Distribution Chart" style="max-width: 100%; height: auto;">
        </div>
        
        <div class="token-distribution">
            ${Object.entries(litepaper.tokenDistribution as Record<string, number>).map(([key, value]) => `
                <div class="distribution-item">
                    <strong>${key.replace(/([A-Z])/g, ' $1').trim()}</strong><br>
                    ${value}%
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section" id="utility">
        <h2>7. Tokenomics Utility</h2>
        <p>${content.tokenomicsUtility.replace(/\n/g, '</p><p>')}</p>
    </div>

    <div class="section" id="emission">
        <h2>8. Emission Schedule</h2>
        <p>${content.emissionSchedule.replace(/\n/g, '</p><p>')}</p>
    </div>

    <div class="section" id="flow">
        <h2>9. Token Flow</h2>
        <p>${content.tokenFlow.replace(/\n/g, '</p><p>')}</p>
    </div>

    <div class="section" id="growth">
        <h2>10. Value Growth Projections</h2>
        <p>${content.valueGrowth.replace(/\n/g, '</p><p>')}</p>
    </div>

    <div class="footer">
        <p>This litepaper was generated using AI technology and should be reviewed by legal and financial experts before use.</p>
    </div>
</body>
</html>
`;
}

async function generatePDF(litepaper: Litepaper, content: any): Promise<string> {
  const htmlContent = generateHTML(litepaper, content);
  
  const browser = await puppeteer.launch({ 
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });
  
  await browser.close();
  
  return Buffer.from(pdf).toString('base64');
}
