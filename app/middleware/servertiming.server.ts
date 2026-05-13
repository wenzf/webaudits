import { createServerTimingMiddleware } from "remix-utils/middleware/server-timing";

export const [serverTimingMiddleware, getTimingCollector] = createServerTimingMiddleware();