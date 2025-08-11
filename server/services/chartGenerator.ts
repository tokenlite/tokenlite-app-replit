import { createCanvas } from 'canvas';

export function generateTokenomicsChart(distribution: Record<string, number>, tokenSymbol: string): string {
  const canvas = createCanvas(600, 400);
  const ctx = canvas.getContext('2d');

  // Clear canvas with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 600, 400);

  // Chart settings
  const centerX = 200;
  const centerY = 200;
  const radius = 120;
  const colors = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Convert percentages to radians
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  let currentAngle = -Math.PI / 2; // Start from top

  // Draw pie slices
  Object.entries(distribution).forEach(([key, value], index) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    currentAngle += sliceAngle;
  });

  // Draw legend
  let legendY = 50;
  ctx.font = '14px Arial';
  Object.entries(distribution).forEach(([key, value], index) => {
    // Color box
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(420, legendY - 10, 15, 15);
    
    // Text
    ctx.fillStyle = 'black';
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    ctx.fillText(`${label}: ${value}%`, 445, legendY + 2);
    legendY += 25;
  });

  // Title
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText(`${tokenSymbol} Token Distribution`, 150, 30);

  return canvas.toDataURL();
}