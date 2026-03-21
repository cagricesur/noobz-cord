import { getAuth } from "@noobz-cord/api";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const routeApi = getRouteApi("/activation");
const authApi = getAuth();

const ActivationView: React.FunctionComponent = () => {
  const search = routeApi.useSearch();
  const nav = routeApi.useNavigate();
  const [isSuccess, setSuccess] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (search.token) {
      authApi
        .postApiAuthActivate({ token: search.token })
        .then(() => {
          setSuccess(true);
          setTimeout(() => {
            nav({ to: "/" });
          }, 1000);
        })
        .catch(() => {
          setSuccess(false);
        });
    }
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
