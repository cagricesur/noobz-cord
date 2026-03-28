import { getAuth } from "@noobz-cord/api";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const authApi = getAuth();

const ActivationView: React.FunctionComponent = () => {
  const routeApi = getRouteApi("/activation");

  const search = routeApi.useSearch();
  const nav = routeApi.useNavigate();
  const [isSuccess, setSuccess] = useState<boolean | undefined>(undefined);

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
          setSuccess(true);
        })
        .catch(() => {
          setSuccess(false);
        });
    }
    return () => {
      controller.abort();
    };
  }, [nav, search.token]);

  return (
    <>
      {isSuccess === false && <div>Activation failed</div>}
      {isSuccess === true && (
        <div>Activation was successful, redirecting...</div>
      )}
      {isSuccess === undefined && <div>Activating...</div>}
    </>
  );
};

export default ActivationView;
