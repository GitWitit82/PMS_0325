import { type Theme } from '@/types/theme';
import { type ChartData, type ChartOptions } from 'chart.js';

export interface ChartConfig {
  data: ChartData;
  options: ChartOptions;
}

export const chartColors = {
  light: [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ],
  dark: [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ],
};

export const chartConfig = {
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  animationDuration: 300,
  strokeWidth: 2,
  dotSize: 4,
};

export const getChartAspectRatio = (chartType: string): number => {
  switch (chartType) {
    case 'pie':
    case 'donut':
      return 1;
    case 'bar':
    case 'line':
      return 16 / 9;
    default:
      return 4 / 3;
  }
};

export const getChartColors = (theme: Theme): string[] => {
  if (theme === 'system') {
    // Check if user prefers dark mode
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return chartColors.dark;
    }
    return chartColors.light;
  }
  return chartColors[theme] || chartColors.light;
};

export const formatChartValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const generateGradient = (
  ctx: CanvasRenderingContext2D,
  startColor: string,
  endColor: string
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, startColor);
  gradient.addColorStop(1, endColor);
  return gradient;
};

export const generateChartConfig = (
  type: 'line' | 'bar' | 'pie' | 'doughnut',
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }>,
  options: Partial<ChartOptions> = {}
): ChartConfig => {
  return {
    data: {
      labels,
      datasets: datasets.map((dataset) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || getRandomColor(),
        borderColor: dataset.borderColor || getRandomColor(),
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: options.plugins?.title?.text || '',
        },
      },
      ...options,
    },
  };
}; 