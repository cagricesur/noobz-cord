import { faker } from "@faker-js/faker";
import {
  Avatar,
  Divider,
  Group,
  List,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconHash, IconVolume } from "@tabler/icons-react";

interface IUser {
  name: string;
}

interface IChannel {
  name: string;
  type: "text" | "voice";
  users?: IUser[];
}

const channels: IChannel[] = [
  ...faker.helpers.multiple(
    () => {
      return {
        name: faker.lorem.word({ length: { min: 5, max: 10 } }),
        type: "text",
      } as IChannel;
    },
    { count: 20 },
  ),
  ...faker.helpers.multiple(
    () => {
      return {
        name: faker.lorem.word({ length: { min: 5, max: 10 } }),
        type: "voice",
        users: faker.helpers.multiple(
          () => {
            return { name: faker.person.firstName() };
          },
          { count: { min: 10, max: 50 } },
        ),
      } as IChannel;
    },
    { count: 10 },
  ),
];

export const Channels: React.FunctionComponent = () => {
  return (
    <Stack>
      {channels
        .filter((channel) => channel.type === "text")
        .map((channel) => {
          return (
            <UnstyledButton>
              <Group gap={4}>
                <IconHash />
                <Text fw="bold">{channel.name}</Text>
              </Group>
            </UnstyledButton>
          );
        })}
      <Divider />
      {channels
        .filter((channel) => channel.type === "voice")
        .map((channel) => {
          return (
            <Stack>
              <UnstyledButton>
                <Group gap={4}>
                  <IconVolume />
                  <Text fw="bold">{`${channel.name} (${channel.users?.length})`}</Text>
                </Group>
              </UnstyledButton>

              <List spacing="xs" size="sm" center>
                {channel.users?.map((user) => {
                  return (
                    <List.Item
                      icon={
                        <Avatar name={user.name} size={32} color="initials" />
                      }
                    >
                      {user.name}
                    </List.Item>
                  );
                })}
              </List>
            </Stack>
          );
        })}
    </Stack>
  );
};
