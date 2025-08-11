import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface TokenomicsChartProps {
  distribution: Record<string, number>;
  tokenSymbol: string;
}

export function TokenomicsChart({ distribution, tokenSymbol }: TokenomicsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = Object.keys(distribution).map(key => 
      key.replace(/([A-Z])/g, ' $1').trim()
    );
    const data = Object.values(distribution);
    const colors = [
      '#3b82f6', // primary-500
      '#6366f1', // secondary-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#8b5cf6', // violet-500
    ];

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 2,
          borderColor: '#ffffff',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                return `${label}: ${value}%`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [distribution]);

  return (
    <div className="w-full h-80">
      <canvas ref={chartRef} />
    </div>
  );
}
