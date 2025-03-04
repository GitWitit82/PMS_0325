import { withAuthorization } from "@/components/higher-order/with-authorization"

function UsersPage() {
  return (
    <div>
      <h1>Users Management</h1>
      {/* Users management UI */}
    </div>
  )
}

export default withAuthorization(UsersPage, {
  allowedRoles: ["ADMINISTRATOR"],
}) 