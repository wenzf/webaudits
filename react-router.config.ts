import type { Config } from "@react-router/dev/config";

export default {
    // Config options...
    future: {
        v8_middleware: true,
    },
    // Server-side render by default, to enable SPA mode set this to `false`
    ssr: true,
} satisfies Config;
