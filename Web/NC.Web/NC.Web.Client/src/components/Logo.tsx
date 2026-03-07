import { Group, Stack, Title } from "@mantine/core";
import logo from "@noobz-cord/assets/logo.png";

interface ILogoProps {
  imgSize?: number;
  layout?: "vertical" | "horizontal";
}

const defaults: ILogoProps = { imgSize: 64, layout: "horizontal" };

const LogoContent: React.FunctionComponent<ILogoProps> = (props) => {
  return (
    <>
      <img src={logo} height={props.imgSize} width={props.imgSize} />
      <Title ff="Cherry Bomb One" c="bright">
        NoobzCord
      </Title>
    </>
  );
};

export const Logo: React.FunctionComponent<ILogoProps> = (_props) => {
  const props = Object.assign(defaults, _props);
  return (
    <>
      {props.layout === "horizontal" ? (
        <Group justify="center">
          <LogoContent {...props} />
        </Group>
      ) : (
        <Stack align="center">
          <LogoContent {...props} />
        </Stack>
      )}
    </>
  );
};
