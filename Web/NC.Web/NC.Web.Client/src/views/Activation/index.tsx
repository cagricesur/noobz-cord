import { LoadingOverlay } from "@mantine/core";
import { getAuth } from "@noobz-cord/api";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect } from "react";

const authApi = getAuth();

const ActivationView: React.FunctionComponent = () => {
  const routeApi = getRouteApi("/activation");
  const search = routeApi.useSearch();
  const nav = routeApi.useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    if (search.token) {
      authApi
        .postApiAuthActivate(
          { token: search.token },
          {
            signal: controller.signal,
          },
        )
        .then(() => {
          nav({ to: "/", search: { activation: true } });
        })
        .catch(() => {
          nav({ to: "/error" });
        });
    }
    return () => {
      controller.abort();
    };
  }, [nav, search.token]);

  return (
    <LoadingOverlay
      visible
      overlayProps={{ fixed: true, blur: 5 }}
      loaderProps={{ type: "bars" }}
    />
  );
};

export default ActivationView;
