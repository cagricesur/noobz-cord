import { Flex, Group, useMantineTheme } from "@mantine/core";
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
import { IUser, UserCard } from "./UserCard";

import classnames from "./index.module.scss";

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
    if (!currentUser) {
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/voice")
      .build();
    let disposed = false;

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
        prevUsers.map((u) => (u.name === user ? { ...u, deafened: true } : u)),
      );
    });
    connection.on("UserUnMutedSelf", (user: string) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.name === user ? { ...u, muted: false } : u)),
      );
    });
    connection.on("UserUnDeafenedSelf", (user: string) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.name === user ? { ...u, deafened: false } : u)),
      );
    });
    connection.on("UserStartedSpeaking", (user: string) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.name === user ? { ...u, speaking: true } : u)),
      );
    });
    connection.on("UserStoppedSpeaking", (user: string) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.name === user ? { ...u, speaking: false } : u)),
      );
    });

    void connection
      .start()
      .then(() => {
        if (disposed) return;
        hubConnectionRef.current = connection;
        return connection.send("JoinGroup", currentUser);
      })
      .catch((err) => {
        if (!disposed) {
          console.error("SignalR connection error: ", err);
        }
      });

    return () => {
      disposed = true;
      hubConnectionRef.current = null;
      void connection.stop();
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
              if (!currentUser) return;
              if (isMuted) {
                hubConnectionRef.current
                  ?.send("UnMuteSelf", currentUser)
                  .then(() => {})
                  .catch((err) => {
                    console.error("Error unmuting self: ", err);
                  });
              } else {
                hubConnectionRef.current
                  ?.send("MuteSelf", currentUser)
                  .then(() => {})
                  .catch((err) => {
                    console.error("Error muting self: ", err);
                  });
              }
              toggleMuted();
            }}
          >
            {isMuted ? <IconMicrophoneOff /> : <IconMicrophone />}
          </ActionIcon>
          <ActionIcon
            variant="transparent"
            color={isDeafened ? red() : white()}
            onClick={() => {
              if (!currentUser) return;
              if (isDeafened) {
                void hubConnectionRef.current?.send(
                  "UnDeafenSelf",
                  currentUser,
                );
              } else {
                void hubConnectionRef.current?.send("DeafenSelf", currentUser);
              }
              toggleDeafened();
            }}
          >
            {isDeafened ? <IconHeadphonesOff /> : <IconHeadphones />}
          </ActionIcon>

          <ActionIcon
            variant="transparent"
            color={red()}
            onClick={() => {
              void hubConnectionRef.current?.send("UserLeft", currentUser);
              logout();
              nav({ to: "/", replace: true });
            }}
          >
            <IconPhoneOff />
          </ActionIcon>
        </Group>
      </Flex>
    </>
  );
};

export default HomeView;
