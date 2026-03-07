import { Button, Divider, Paper, Stack, TextInput } from "@mantine/core";
import { hasLength, isEmail, useForm } from "@mantine/form";
import { Logo } from "@noobz-cord/components";
import { useAuthStore } from "@noobz-cord/stores";

export const AuthForm: React.FunctionComponent = () => {
  const setIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated);
  const form = useForm({
    mode: "controlled",
    initialValues: { name: "", email: "" },
    validate: {
      name: hasLength({ min: 3 }, "Must be at least 3 characters"),
      email: isEmail("Invalid email"),
    },
  });

  return (
    <Paper maw={480} m="auto" mt={64} p="md" shadow="lg">
      <Stack>
        <Logo layout="vertical" />
        <Divider
          my="xs"
          label="A Communications Thingy for the Uninitiated"
          labelPosition="center"
        />
        <form
          onSubmit={form.onSubmit((values) => {
            setIsAuthenticated(true);
          })}
        >
          <TextInput
            {...form.getInputProps("name")}
            label="Name"
            placeholder="Name"
          />
          <TextInput
            {...form.getInputProps("email")}
            mt="md"
            label="Email"
            placeholder="Email"
          />
          <Button type="submit" mt="md">
            Submit
          </Button>
        </form>
      </Stack>
    </Paper>
  );
};
