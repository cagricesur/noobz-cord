import { ActionIcon, Tooltip } from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export const LanguageSwitcher: React.FunctionComponent = () => {
  const { t, i18n } = useTranslation();

  return (
    <Tooltip
      label={
        i18n.language === "en"
          ? t("COMPONENTS.LANGUAGESWITCHER.TOOLTIP.TR")
          : t("COMPONENTS.LANGUAGESWITCHER.TOOLTIP.EN")
      }
      position="bottom"
    >
      <ActionIcon
        variant="subtle"
        size="lg"
        onClick={() =>
          i18n.changeLanguage(i18n.language === "en" ? "tr" : "en")
        }
      >
        <IconLanguage size={20} />
      </ActionIcon>
    </Tooltip>
  );
};
