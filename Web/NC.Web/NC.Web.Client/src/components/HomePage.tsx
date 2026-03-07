import { Button, Stack, Title } from "@mantine/core";
import { useAuthStore } from "@noobz-cord/stores";
import { Link } from "@tanstack/react-router";

export function HomePage() {
  const setIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated);

  return (
    <div className="p-4">
      <Title order={1} mb="md">
        Home
      </Title>
      <p className="mb-4">You are signed in. Welcome!</p>
      <Stack gap="sm">
        <div className="flex gap-2 flex-wrap">
          <Link to="/dashboard">
            <Button variant="light">Dashboard</Button>
          </Link>
          <Link to="/settings">
            <Button variant="light">Settings</Button>
          </Link>
          <Link to="/about">
            <Button variant="subtle">About</Button>
          </Link>
        </div>
        <Button
          variant="outline"
          color="red"
          onClick={() => setIsAuthenticated(false)}
        >
          Sign out
        </Button>
      </Stack>
    </div>
  );
}
