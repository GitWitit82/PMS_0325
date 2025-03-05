/**
 * Theme type for the application
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Chart theme configuration
 */
export interface ChartTheme {
  colors: string[]
  backgroundColor: string
  textColor: string
  gridColor: string
} 