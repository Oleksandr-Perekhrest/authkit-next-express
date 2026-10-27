// local dependencies
import { createApp } from "./app";
import { env } from "./config/env";
import { startRefreshTokenCleanup } from "./jobs/cleanup-refresh-tokens";

const app = createApp();

app.listen(env.PORT, () => {
    console.log(`api listening on http://localhost:${env.PORT}`);
    startRefreshTokenCleanup();
});
