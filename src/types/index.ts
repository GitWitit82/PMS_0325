export type BaseRecord = {
  id: string
  createdAt: Date
  updatedAt: Date
}

export type AnyObject = Record<string, unknown>

export interface PageProps<T extends Record<string, unknown> = Record<string, unknown>> {
  params: T
  searchParams: { [key: string]: string | string[] | undefined }
} 