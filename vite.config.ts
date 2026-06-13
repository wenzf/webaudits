import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
//import devtoolsJson from 'vite-plugin-devtools-json';


export default defineConfig({
    plugins: [
        tailwindcss(),
        reactRouter(),
      //  devtoolsJson()
    ],
    resolve: {
        tsconfigPaths: true
    },
    server: {
        port: 3434
    },
    build: {
        assetsInlineLimit: (filePath: string, content: Buffer) => {
            if (filePath.endsWith('.woff2') || filePath.endsWith('.woff')) {
                return false // never inline fonts
            }
            return undefined // fall back to Vite's default behaviour
        },

        minify: true,
        //rollupOptions: {
        //    output: {
        //        manualChunks(id) {
        //            // core ui elments
        //           // if (id.includes('app/site/utils/')) {
        //           //     return 'ui_core_1';
        //           // }
        //            if (id.includes('app/site/ui/core/')) {
        //                return 'ui_core_1';
        //            }
        //            //if (id.includes('app/site/ui/audit/query/')) {
        //            //    return 'ui_core_1';
        //            //}
        //            // hooks, shard utils, markdown parser
        //            // if (id.includes('app/site/shared/')) {
        //            //     return 'ui_core_2';
        //            // }
        //            //if (id.includes('app/common/shared/')) {
        //            //    return 'ui_core_2';
        //            //}
        //        }
        //    }
        //}
    }
});
