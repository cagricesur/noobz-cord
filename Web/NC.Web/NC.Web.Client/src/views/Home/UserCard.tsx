import {
  Avatar,
  Card,
  Flex,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";

import { IconHeadphonesOff, IconMicrophoneOff } from "@tabler/icons-react";

import classnames from "./index.module.scss";

export interface IUser {
  name: string;
  muted?: boolean;
  deafened?: boolean;
  speaking?: boolean;
}

export const UserCard: React.FunctionComponent<IUser> = (user) => {
  const theme = useMantineTheme();
  return (
    <Card
      radius="md"
      w={256}
      withBorder
      className={user.speaking ? classnames.speaking : undefined}
    >
      <Stack justify="center" align="center">
        <Avatar name={user.name} radius="xl" color="initials" size={48} />
        <Flex w={224} justify="center">
          <Stack>
            <Text truncate="end">{user.name}</Text>
            {(user.muted || user.deafened) && (
              <Group justify="center">
                {user.muted && (
                  <IconMicrophoneOff color={theme.colors.red[6]} />
                )}
                {user.deafened && (
                  <IconHeadphonesOff color={theme.colors.red[6]} />
                )}
              </Group>
            )}
          </Stack>
        </Flex>
      </Stack>
    </Card>
  );
};
