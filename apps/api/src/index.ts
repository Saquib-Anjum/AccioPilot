import { createApiApp } from "./app.js";
const port = Number(process.env.PORT ?? 4000);
createApiApp().listen(port, () =>
  console.log(`AccioPilot API listening on ${port}`),
);
