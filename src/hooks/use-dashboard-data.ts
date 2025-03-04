import { useQuery } from "@tanstack/react-query"

/**
 * Hook for fetching project statistics
 */
export function useProjectStats() {
  return useQuery({
    queryKey: ["projectStats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/projects")
      if (!response.ok) {
        throw new Error("Failed to fetch project statistics")
      }
      return response.json()
    }
  })
}

/**
 * Hook for fetching resource utilization
 */
export function useResourceUtilization() {
  return useQuery({
    queryKey: ["resourceUtilization"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/resources")
      if (!response.ok) {
        throw new Error("Failed to fetch resource utilization")
      }
      return response.json()
    }
  })
}

/**
 * Hook for fetching upcoming tasks
 */
export function useUpcomingTasks(userId?: string) {
  return useQuery({
    queryKey: ["upcomingTasks", userId],
    queryFn: async () => {
      const url = userId 
        ? `/api/dashboard/tasks?userId=${userId}`
        : "/api/dashboard/tasks"
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch upcoming tasks")
      }
      return response.json()
    }
  })
} 