// local dependencies
import { deleteExpiredRefreshTokens } from "../modules/auth/auth.service";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

const run = async () => {
    try {
        const count = await deleteExpiredRefreshTokens();
        if (count > 0) {
            console.log(`cleanup-refresh-tokens: deleted ${count} expired rows`);
        }
    } catch (err) {
        console.error("cleanup-refresh-tokens: failed", err);
    }
};

export const startRefreshTokenCleanup = () => {
    void run();
    const timer = setInterval(() => void run(), SIX_HOURS_MS);
    timer.unref();
};
