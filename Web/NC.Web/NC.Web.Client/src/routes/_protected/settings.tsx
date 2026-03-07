import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-4">
      <h1>Settings</h1>
      <p>Protected settings page.</p>
      <nav className="mt-2 flex gap-2">
        <Link to="/" className="text-primary underline">
          Home
        </Link>
        <Link to="/dashboard" className="text-primary underline">
          Dashboard
        </Link>
      </nav>
    </div>
  );
}
