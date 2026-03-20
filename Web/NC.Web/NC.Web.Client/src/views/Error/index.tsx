import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";

const ErrorView: React.FunctionComponent = () => {
  return (
    <Center mih="100dvh" p="md">
      <Stack gap="sm" align="center" maw={480}>
        <IconExclamationCircle size={96} />
        <Title order={2} ta="center">
          ERROR
        </Title>
        <Text c="dimmed" ta="center">
          Something unexpected occured
        </Text>
        <Text c="dimmed" ta="center">
          Please try again later
        </Text>

        <Button
          mt="xl"
          onClick={() => {
            window.location.replace("/");
          }}
        >
          RETRY
        </Button>
      </Stack>
    </Center>
  );
};

export default ErrorView;
