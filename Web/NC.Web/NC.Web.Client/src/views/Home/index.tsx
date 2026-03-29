import {
  Avatar,
  Card,
  Flex,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "@noobz-cord/stores";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { ActionIcon } from "@mantine/core";
import { IconHeadphonesOff, IconMicrophoneOff } from "@tabler/icons-react";

import { useMantineColorScheme } from "@mantine/core";
import {
  IconHeadphones,
  IconMicrophone,
  IconPhoneOff,
} from "@tabler/icons-react";

import { useToggle } from "@mantine/hooks";

import classnames from "./index.module.scss";

interface IUser {
  name: string;
  muted?: boolean;
  deafened?: boolean;
  speaking?: boolean;
}

const UserCard: React.FunctionComponent<IUser> = (user) => {
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
              <Group>
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

const HomeView: React.FunctionComponent = () => {
  const route = getRouteApi("/");
  const nav = route.useNavigate();
  const hubConnectionRef = useRef<signalR.HubConnection>(null);
  const currentUser = useAuthStore((s) => s.user?.name);
  const logout = useAuthStore((s) => s.logout);
  const [users, setUsers] = useState<IUser[]>([
    { name: currentUser ?? "Unknown User" },
  ]);
  const [isMuted, toggleMuted] = useToggle();
  const [isDeafened, toggleDeafened] = useToggle();
  const theme = useMantineTheme();
  const cs = useMantineColorScheme();

  const white = () => {
    return theme.colors.gray[cs.colorScheme === "dark" ? 3 : 6];
  };
  const red = () => {
    return theme.colors.red[6];
  };

  useEffect(() => {
    if (currentUser) {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("/hubs/voice")
        .build();

      connection.on("UserLeft", (user: string) => {
        setUsers((prevUsers) => prevUsers.filter((u) => u.name !== user));
      });
      connection.on("UserMultipleSessionDisconnect", () => {
        logout();
        nav({ to: "/", replace: true });
      });
      connection.on("UserJoined", (user: string) => {
        setUsers((prevUsers) => [...prevUsers, { name: user }]);
      });
      connection.on("UsersInRoomInit", (users: string[]) => {
        setUsers(users.map((name) => ({ name })));
      });

      connection.on("UserMutedSelf", (user: string) => {
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.name === user ? { ...u, muted: true } : u)),
        );
      });
      connection.on("UserDeafenedSelf", (user: string) => {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.name === user ? { ...u, deafened: true } : u,
          ),
        );
      });
      connection.on("UserUnMutedSelf", (user: string) => {
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.name === user ? { ...u, muted: false } : u)),
        );
      });
      connection.on("UserUnDeafenedSelf", (user: string) => {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.name === user ? { ...u, deafened: false } : u,
          ),
        );
      });
      connection.on("UserStartedSpeaking", (user: string) => {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.name === user ? { ...u, speaking: true } : u,
          ),
        );
      });
      connection.on("UserStoppedSpeaking", (user: string) => {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.name === user ? { ...u, speaking: false } : u,
          ),
        );
      });

      connection.start().then(
        () => {
          hubConnectionRef.current = connection;
          hubConnectionRef.current.send("JoinGroup", currentUser);
        },
        (err) => {
          console.error("SignalR connection error: ", err);
        },
      );
    }

    return () => {
      void hubConnectionRef.current?.stop();
    };
  }, [currentUser, logout, nav]);

  return (
    <>
      <Flex
        columnGap={16}
        rowGap={16}
        wrap="wrap"
        justify="center"
        classNames={classnames}
      >
        {users.map((user) => {
          return <UserCard key={user.name} {...user} />;
        })}
      </Flex>

      <Flex
        pos="fixed"
        bottom={16}
        right={0}
        left={0}
        justify="center"
        px="xs"
        h={64}
      >
        <Group>
          <ActionIcon
            variant="transparent"
            color={isMuted ? red() : white()}
            onClick={() => {
              debugger;
              toggleMuted();
              if (isMuted) {
                hubConnectionRef.current
                  ?.send("UnMuteSelf")
                  .then(() => {})
                  .catch((err) => {
                    console.error("Error unmuting self: ", err);
                  });
              } else {
                hubConnectionRef.current
                  ?.send("MuteSelf")
                  .then(() => {})
                  .catch((err) => {
                    console.error("Error muting self: ", err);
                  });
              }
            }}
          >
            {isMuted ? <IconMicrophoneOff /> : <IconMicrophone />}
          </ActionIcon>
          <ActionIcon
            variant="transparent"
            color={isDeafened ? red() : white()}
            onClick={() => {
              toggleDeafened();
              if (isDeafened) {
                hubConnectionRef.current?.send("UnDeafenSelf");
              } else {
                hubConnectionRef.current?.send("DeafenSelf");
              }
            }}
          >
            {isDeafened ? <IconHeadphonesOff /> : <IconHeadphones />}
          </ActionIcon>

          <ActionIcon variant="transparent" color={red()}>
            <IconPhoneOff />
          </ActionIcon>
        </Group>
      </Flex>
    </>
  );
};

export default HomeView;
