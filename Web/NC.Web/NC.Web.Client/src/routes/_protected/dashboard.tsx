import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="p-4">
      <h1>Dashboard</h1>
      <p>This page is only visible when authenticated.</p>
      <nav className="mt-2 flex gap-2">
        <Link to="/" className="text-primary underline">
          Home
        </Link>
        <Link to="/settings" className="text-primary underline">
          Settings
        </Link>
      </nav>
    </div>
  );
}
