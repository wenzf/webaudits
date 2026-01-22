import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import devtoolsJson from 'vite-plugin-devtools-json';


export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    devtoolsJson()
  ],
  // optimizeDeps: {
  //   include: [],
  // },
  server: {
    port: 3434
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // core ui elments
          if (id.includes('app/site/utils/')) {
            return 'ui_core_1';
          }
          if (id.includes('app/site/ui/core/')) {
            return 'ui_core_1';
          }
          if (id.includes('app/site/ui/audit/query/')) {
            return 'ui_core_1';
          }
          // hooks, shard utils, markdown parser
          if (id.includes('app/site/shared/')) {
            return 'ui_core_2';
          }
          if (id.includes('app/common/shared/')) {
            return 'ui_core_2';
          }
        }
      }
    }
  }
});
