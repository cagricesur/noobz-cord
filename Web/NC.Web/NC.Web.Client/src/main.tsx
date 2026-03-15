import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "@noobz-cord/App";
import { CookiesProvider } from "react-cookie";

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <CookiesProvider>
        <App />
      </CookiesProvider>
    </StrictMode>,
  );
}
