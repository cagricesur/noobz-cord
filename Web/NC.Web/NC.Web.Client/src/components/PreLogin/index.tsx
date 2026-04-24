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
    <>
      <ReactBits.FloatingLines
        enabledWaves={["top", "middle", "bottom"]}
        lineCount={5}
        lineDistance={5}
        bendRadius={5}
        bendStrength={-0.5}
        interactive={false}
        parallax={false}
        linesGradient={[
          "#81e1ab",
          "#70dc9f",
          "#45d282",
          "#37cf7a",
          "#71d9f0",
          "#3ecae9",
          "#30c6e7",
          "#16c3e7",
        ]}
      />
      <Flex h="100dvh" justify="center" align="center" p="md">
        <Paper radius="md" p="xl" className={classNames.root}>
          <Stack align="stretch" gap={0}>
            <Group justify="center">
              <Image src={logo} h={64} w={64} />
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
    </>
  );
};
