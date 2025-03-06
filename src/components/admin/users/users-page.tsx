"use client"

import { withAuthorization } from "@/components/higher-order/with-authorization"

function UsersPageClient() {
  return (
    <div>
      <h1>Users Management</h1>
      {/* Users management UI */}
    </div>
  )
}

export default withAuthorization(UsersPageClient, {
  allowedRoles: ["ADMINISTRATOR"],
}) 