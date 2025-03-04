import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Upcoming tasks component for dashboard
 */
export function UpcomingTasks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add task list here */}
        <div className="text-muted-foreground">
          Upcoming tasks will be displayed here
        </div>
      </CardContent>
    </Card>
  )
} 