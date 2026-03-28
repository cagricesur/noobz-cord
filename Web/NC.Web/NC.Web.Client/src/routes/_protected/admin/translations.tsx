import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/admin/translations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/admin/translations"!</div>
}
