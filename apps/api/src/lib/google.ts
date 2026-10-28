// outsource dependencies
import { Google } from "arctic";

// local dependencies
import { env } from "../config/env";

export const google = new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
);
