import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Projects overview component for dashboard
 */
export function ProjectsOverview({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Projects Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add project statistics and charts here */}
        <div className="text-muted-foreground">
          Project statistics will be displayed here
        </div>
      </CardContent>
    </Card>
  )
} 