import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="h-full w-full min-w-0 overflow-hidden">
      <Outlet />
    </div>
  )
}
