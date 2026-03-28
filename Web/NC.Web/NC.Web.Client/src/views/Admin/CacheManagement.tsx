import { ActionIcon, Button, Group, Stack, Table } from "@mantine/core";
import { type CacheEntryStatistics, getCache } from "@noobz-cord/api";
import {
  IconRefresh,
  IconSquareRoundedXFilled,
  IconXFilled,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const cacheApi = getCache();

const CacheManagementView: React.FunctionComponent = () => {
  const [stats, setStats] = useState<CacheEntryStatistics[]>([]);
  const { t } = useTranslation();

  const remove = (key: string) => {
    cacheApi.postApiCacheRemove({ key }).then(() => {
      refresh();
    });
  };

  const clear = () => {
    cacheApi.postApiCacheClear().then(() => {
      refresh();
    });
  };
  const refresh = (signal?: AbortSignal) => {
    cacheApi.getApiCacheStatistics({ signal }).then((response) => {
      setStats(response ?? []);
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    refresh(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Stack>
      <Group justify="flex-end">
        <Button color="red" rightSection={<IconXFilled />} onClick={clear}>
          Clear
        </Button>
        <Button
          color="green"
          rightSection={<IconRefresh />}
          onClick={() => refresh()}
        >
          Refresh
        </Button>
      </Group>
      <Table stickyHeader stickyHeaderOffset={60}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("VIEW.CACHEMANAGEMENT.TH.KEY")}</Table.Th>
            <Table.Th>{t("VIEW.CACHEMANAGEMENT.TH.ISSLIDING")}</Table.Th>
            <Table.Th>{t("VIEW.CACHEMANAGEMENT.TH.SIZE")}</Table.Th>
            <Table.Th>{t("VIEW.CACHEMANAGEMENT.TH.EXPIRATION")}</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {stats.map((stat) => {
            return (
              <Table.Tr key={stat.key}>
                <Table.Td>{stat.key}</Table.Td>
                <Table.Td>{stat.isSliding}</Table.Td>
                <Table.Td align="right">{stat.approximateSizeBytes}</Table.Td>
                <Table.Td align="right">{stat.expiration}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="transparent"
                    color="white"
                    onClick={() => remove(stat.key)}
                  >
                    <IconSquareRoundedXFilled />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};

export default CacheManagementView;
