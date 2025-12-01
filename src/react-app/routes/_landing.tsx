import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_landing')({
  component: LandingLayout,
})

function LandingLayout() {
  return <Outlet />
}
