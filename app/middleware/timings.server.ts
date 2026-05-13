import type { MiddlewareFunction } from "react-router";

export const timingsMiddleware: MiddlewareFunction = async (_, next) => {
  const start = performance.now();
  const response = await next() as Response;
  const total = performance.now() - start;
  response.headers.append("Server-Timing", `total;dur=${total.toFixed(2)};desc="Total"`);
    response.headers.set("X-Request-Sent", Date.now().toString());
  return response;
};
