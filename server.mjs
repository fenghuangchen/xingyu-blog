import { createServer } from "node:http";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOST || "0.0.0.0";

const app = next({ dev, hostname, port, turbopack: true });
const handle = app.getRequestHandler();

await app.prepare();

const upgradeHandler = app.getUpgradeHandler();

const server = createServer((req, res) => {
  handle(req, res);
});

server.on("upgrade", upgradeHandler);

server.listen(port, hostname, () => {
  console.log(`> 星屿手记 ready on http://${hostname}:${port}`);
});
