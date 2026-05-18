import type { Config } from "@react-router/dev/config";

export default {
    // Config options...
    future: {
        v8_middleware: true,
    },

    // Server-side render by default, to enable SPA mode set this to `false`
    ssr: true,
    //   buildDirectory: "build",
    //   serverBuildFile: "index.js",

  //  async serverBundles({ branch, }) {
  //      const isCMSRoute = branch.some((route) => route.id.startsWith("cms"));
  //      if (isCMSRoute) {
  //          return 'cms-bundle'
//
//
  //      }
  //      return "main"
  //  }
} satisfies Config;
