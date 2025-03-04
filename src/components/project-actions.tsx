import { RoleGuard } from "@/components/auth/role-guard"
import { Button } from "@/components/ui/button"

export function ProjectActions() {
  return (
    <div className="space-x-2">
      <RoleGuard allowedRoles={["ADMINISTRATOR", "MANAGER"]}>
        <Button>Edit Project</Button>
        <Button variant="destructive">Delete Project</Button>
      </RoleGuard>
      <RoleGuard allowedRoles={["SUPERVISOR"]}>
        <Button>Update Status</Button>
      </RoleGuard>
    </div>
  )
} 