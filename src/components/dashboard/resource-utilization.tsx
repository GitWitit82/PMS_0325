import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Resource utilization component for dashboard
 */
export function ResourceUtilization({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Resource Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add resource utilization charts here */}
        <div className="text-muted-foreground">
          Resource utilization data will be displayed here
        </div>
      </CardContent>
    </Card>
  )
} 