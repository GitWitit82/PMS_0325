import { type Theme } from '@/types/theme'

/**
 * Default chart colors for light and dark themes
 */
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
}

/**
 * Common chart configuration options
 */
export const chartConfig = {
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  animationDuration: 300,
  strokeWidth: 2,
  dotSize: 4,
}

/**
 * Get responsive container aspect ratio based on chart type
 * @param {string} chartType - The type of chart
 * @returns {number} The aspect ratio for the responsive container
 */
export const getChartAspectRatio = (chartType: string): number => {
  switch (chartType) {
    case 'pie':
    case 'donut':
      return 1 // Square aspect ratio for pie/donut charts
    case 'bar':
    case 'line':
      return 16 / 9 // Widescreen aspect ratio for bar/line charts
    default:
      return 4 / 3 // Default aspect ratio
  }
}

/**
 * Get chart colors based on current theme
 * @param {Theme} theme - Current theme (light/dark)
 * @returns {string[]} Array of chart colors
 */
export const getChartColors = (theme: Theme): string[] => {
  return chartColors[theme] || chartColors.light
}

/**
 * Format large numbers for chart labels
 * @param {number} value - The number to format
 * @returns {string} Formatted number string
 */
export const formatChartValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

/**
 * Generate chart tooltip content
 * @param {object} props - Tooltip props from Recharts
 * @returns {JSX.Element | null} Tooltip content component
 */
export const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg bg-background p-2 shadow-lg ring-1 ring-border">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {formatChartValue(entry.value)}
        </p>
      ))}
    </div>
  )
} 