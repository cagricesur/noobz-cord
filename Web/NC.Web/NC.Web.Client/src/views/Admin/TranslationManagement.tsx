import { getParameter, type TranslationData } from "@noobz-cord/api";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";

const parameterApi = getParameter();
const TranslationManagementView: React.FunctionComponent = () => {
  const [translations, setTranslations] = useState<TranslationData[]>([]);

  const refresh = (signal?: AbortSignal) => {
    const en = parameterApi.getApiParameterGetTranslations(
      { language: "en" },
      { signal },
    );
    const tr = parameterApi.getApiParameterGetTranslations(
      { language: "tr" },
      { signal },
    );

    Promise.all([en, tr]).then((data) => {
      setTranslations([...(data[0] ?? []), ...(data[1] ?? [])]);
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
    <DataTable
      withColumnBorders
      striped
      highlightOnHover
      // provide data
      records={translations}
      // define columns
      columns={[
        {
          accessor: "name",
        },
        { accessor: "language" },
        {
          accessor: "value",
        },
      ]}
    />
  );
};

export default TranslationManagementView;
