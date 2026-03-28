import { ActionIcon, Card, Flex, Group, Stack, Text } from "@mantine/core";
import {
  IconAccessPoint,
  IconChevronLeft,
  IconLanguage,
  type IconProps,
} from "@tabler/icons-react";
import { getRouteApi, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import type { FileRoutesByTo } from "@noobz-cord/routeTree.gen";
import { useState } from "react";
import classes from "./index.module.scss";

interface IAdminManager {
  name: string;
  icon: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<SVGSVGElement>
  >;
  path: keyof FileRoutesByTo;
}

const managers: IAdminManager[] = [
  {
    name: "VIEW.ADMIN.MANAGERS.CACHE",
    icon: IconAccessPoint,
    path: "/admin/cache",
  },
  {
    name: "VIEW.ADMIN.MANAGERS.TRANSLATION",
    icon: IconLanguage,
    path: "/admin/translations",
  },
];

const AdminView: React.FunctionComponent = () => {
  const indexPath: keyof FileRoutesByTo = "/admin";
  const router = getRouteApi("/_protected/admin");
  const [currentManager, setCurrentManager] = useState<
    IAdminManager | undefined
  >();
  const nav = router.useNavigate();
  const { t } = useTranslation();

  const navigate = (manager: IAdminManager) => {
    nav({ to: manager.path });
    setCurrentManager(manager);
  };

  return (
    <Stack classNames={classes}>
      {currentManager && (
        <Group gap="md">
          <ActionIcon
            variant="transparent"
            color="white"
            onClick={() => {
              nav({ to: indexPath });
              setCurrentManager(undefined);
            }}
          >
            <IconChevronLeft />
          </ActionIcon>

          <Text size="sm" c="dimmed">
            {t(currentManager.name)}
          </Text>
        </Group>
      )}

      {!currentManager && (
        <Flex direction="row" wrap="wrap" rowGap="md" columnGap="md">
          {managers.map((manager, index) => {
            return (
              <Card
                key={index}
                shadow="sm"
                padding="lg"
                radius="md"
                className={classes.manager}
                withBorder
                onClick={() => navigate(manager)}
              >
                <Stack justify="center" align="center" w={320}>
                  <manager.icon size={48} />
                  <Text size="sm" c="dimmed">
                    {t(manager.name)}
                  </Text>
                </Stack>
              </Card>
            );
          })}
        </Flex>
      )}

      {currentManager && <Outlet />}
    </Stack>
  );
};

export default AdminView;
