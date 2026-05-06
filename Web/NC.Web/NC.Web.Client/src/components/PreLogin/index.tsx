import { Divider, Flex, Group, Image, Paper, Stack } from "@mantine/core";
import {
  ColorSchemeSwitcher,
  LanguageSwitcher,
  ReactBits,
} from "@noobz-cord/components";
import { type PropsWithChildren } from "react";

import logo from "@noobz-cord/assets/logo.png";
import classNames from "./index.module.scss";

interface IPreLoginProps extends PropsWithChildren {
  hasColorSchemeSwitcher?: boolean;
  hasLanguageSwitcher?: boolean;
  onLanguageSwitched?: () => void;
}

export const PreLogin: React.FunctionComponent<IPreLoginProps> = (props) => {
  return (
      <Flex className={classNames.screen}>
          <Paper radius="lg" shadow="xl" className={classNames.root}>
        <Stack align="stretch" gap={0}>
          <Group justify="center">
            <Image src={logo} h={64} w={64} alt="NoobzCord" />
          </Group>
          <ReactBits.GradientText
            className={classNames.brand}
            colors={["#70DC9F", "#3ECAE9"]}
            animationSpeed={8}
            yoyo
          >
            NoobzCord
          </ReactBits.GradientText>

          <Divider
            my={32}
            label={
              props.hasColorSchemeSwitcher || props.hasLanguageSwitcher ? (
                <Group justify="center">
                  {props.hasLanguageSwitcher && (
                    <LanguageSwitcher onChange={props.onLanguageSwitched} />
                  )}
                  {props.hasColorSchemeSwitcher && <ColorSchemeSwitcher />}
                </Group>
              ) : null
            }
          />

          {props.children}
        </Stack>
      </Paper>
    </Flex>
  );
};
