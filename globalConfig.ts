import "./utils/eventSourcePolyfill";

export const GOOGLE_REDIRECT_URI = "com.louislam09.savezy";
export const POCKETBASE_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL;

import PocketBase from "pocketbase";

export const pb = new PocketBase(POCKETBASE_URL);
