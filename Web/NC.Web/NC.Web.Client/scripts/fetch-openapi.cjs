const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const url =
  process.env.OPENAPI_URL ||
  "http://localhost:5215/openapi/v1.json";

const client = url.startsWith("https") ? https : http;

client
  .get(url, { rejectUnauthorized: false }, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const out = path.join(__dirname, "..", "openapi.json");
      fs.writeFileSync(out, data, "utf8");
      console.log("Written openapi.json from", url);
    });
  })
  .on("error", (err) => {
    console.error("Failed to fetch OpenAPI spec:", err.message);
    process.exit(1);
  });
