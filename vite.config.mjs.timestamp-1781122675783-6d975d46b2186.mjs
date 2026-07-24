// vite.config.mjs
import AutoImport from "file:///D:/SGajardo/Google%20Drive/Antigravity/terracon-pwa/lg-terracon-main/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/SGajardo/Google%20Drive/Antigravity/terracon-pwa/lg-terracon-main/node_modules/unplugin-vue-components/dist/vite.js";
import Fonts from "file:///D:/SGajardo/Google%20Drive/Antigravity/terracon-pwa/lg-terracon-main/node_modules/unplugin-fonts/dist/vite.mjs";
import Layouts from "file:///D:/SGajardo/Google%20Drive/Antigravity/terracon-pwa/lg-terracon-main/node_modules/vite-plugin-vue-layouts/dist/index.mjs";
import Vue from "file:///D:/SGajardo/Google%20Drive/Antigravity/terracon-pwa/lg-terracon-main/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import VueRouter from "file:///D:/SGajardo/Google%20Drive/Antigravity/terracon-pwa/lg-terracon-main/node_modules/unplugin-vue-router/dist/vite.js";
import Vuetify, { transformAssetUrls } from "file:///D:/SGajardo/Google%20Drive/Antigravity/terracon-pwa/lg-terracon-main/node_modules/vite-plugin-vuetify/dist/index.mjs";
import { defineConfig, loadEnv } from "file:///D:/SGajardo/Google%20Drive/Antigravity/terracon-pwa/lg-terracon-main/node_modules/vite/dist/node/index.js";
import { fileURLToPath, URL } from "node:url";
var __vite_injected_original_import_meta_url = "file:///D:/SGajardo/Google%20Drive/Antigravity/terracon-pwa/lg-terracon-main/vite.config.mjs";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawBaseUrl = env.VITE_APP_BASE_URL || "/";
  let base = "/";
  try {
    const parsed = new URL(rawBaseUrl);
    base = parsed.pathname || "/";
  } catch {
    base = rawBaseUrl.startsWith("/") ? rawBaseUrl : `/${rawBaseUrl}`;
  }
  if (!base.endsWith("/")) base = `${base}/`;
  return {
    base,
    plugins: [
      VueRouter(),
      Layouts(),
      Vue({
        template: { transformAssetUrls }
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
      Vuetify({
        autoImport: true,
        styles: {
          configFile: "src/styles/settings.scss"
        }
      }),
      Components(),
      Fonts({
        google: {
          families: [{
            name: "Roboto",
            styles: "wght@100;300;400;500;700;900"
          }]
        }
      }),
      AutoImport({
        imports: [
          "vue",
          "vue-router"
        ],
        eslintrc: {
          enabled: true
        },
        vueTemplate: true
      })
    ],
    define: { "process.env": {} },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      },
      extensions: [
        ".js",
        ".json",
        ".jsx",
        ".mjs",
        ".ts",
        ".tsx",
        ".vue"
      ]
    },
    server: {
      port: 3e3
    },
    css: {
      preprocessorOptions: {
        sass: {
          api: "modern-compiler"
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcU0dhamFyZG9cXFxcR29vZ2xlIERyaXZlXFxcXEFudGlncmF2aXR5XFxcXHRlcnJhY29uLXB3YVxcXFxsZy10ZXJyYWNvbi1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxTR2FqYXJkb1xcXFxHb29nbGUgRHJpdmVcXFxcQW50aWdyYXZpdHlcXFxcdGVycmFjb24tcHdhXFxcXGxnLXRlcnJhY29uLW1haW5cXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9TR2FqYXJkby9Hb29nbGUlMjBEcml2ZS9BbnRpZ3Jhdml0eS90ZXJyYWNvbi1wd2EvbGctdGVycmFjb24tbWFpbi92aXRlLmNvbmZpZy5tanNcIjsvLyBQbHVnaW5zXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcbmltcG9ydCBGb250cyBmcm9tICd1bnBsdWdpbi1mb250cy92aXRlJ1xuaW1wb3J0IExheW91dHMgZnJvbSAndml0ZS1wbHVnaW4tdnVlLWxheW91dHMnXG5pbXBvcnQgVnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCBWdWVSb3V0ZXIgZnJvbSAndW5wbHVnaW4tdnVlLXJvdXRlci92aXRlJ1xuaW1wb3J0IFZ1ZXRpZnksIHsgdHJhbnNmb3JtQXNzZXRVcmxzIH0gZnJvbSAndml0ZS1wbHVnaW4tdnVldGlmeSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpXG4gIGNvbnN0IHJhd0Jhc2VVcmwgPSBlbnYuVklURV9BUFBfQkFTRV9VUkwgfHwgJy8nXG4gIGxldCBiYXNlID0gJy8nXG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTChyYXdCYXNlVXJsKVxuICAgIGJhc2UgPSBwYXJzZWQucGF0aG5hbWUgfHwgJy8nXG4gIH0gY2F0Y2gge1xuICAgIGJhc2UgPSByYXdCYXNlVXJsLnN0YXJ0c1dpdGgoJy8nKSA/IHJhd0Jhc2VVcmwgOiBgLyR7cmF3QmFzZVVybH1gXG4gIH1cbiAgaWYgKCFiYXNlLmVuZHNXaXRoKCcvJykpIGJhc2UgPSBgJHtiYXNlfS9gXG5cbiAgcmV0dXJuIHtcbiAgYmFzZSxcbiAgcGx1Z2luczogW1xuICAgIFZ1ZVJvdXRlcigpLFxuICAgIExheW91dHMoKSxcbiAgICBWdWUoe1xuICAgICAgdGVtcGxhdGU6IHsgdHJhbnNmb3JtQXNzZXRVcmxzIH1cbiAgICB9KSxcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdnVldGlmeWpzL3Z1ZXRpZnktbG9hZGVyL3RyZWUvbWFzdGVyL3BhY2thZ2VzL3ZpdGUtcGx1Z2luI3JlYWRtZVxuICAgIFZ1ZXRpZnkoe1xuICAgICAgYXV0b0ltcG9ydDogdHJ1ZSxcbiAgICAgIHN0eWxlczoge1xuICAgICAgICBjb25maWdGaWxlOiAnc3JjL3N0eWxlcy9zZXR0aW5ncy5zY3NzJyxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgQ29tcG9uZW50cygpLFxuICAgIEZvbnRzKHtcbiAgICAgIGdvb2dsZToge1xuICAgICAgICBmYW1pbGllczogW3tcbiAgICAgICAgICBuYW1lOiAnUm9ib3RvJyxcbiAgICAgICAgICBzdHlsZXM6ICd3Z2h0QDEwMDszMDA7NDAwOzUwMDs3MDA7OTAwJyxcbiAgICAgICAgfV0sXG4gICAgICB9LFxuICAgIH0pLFxuICAgIEF1dG9JbXBvcnQoe1xuICAgICAgaW1wb3J0czogW1xuICAgICAgICAndnVlJyxcbiAgICAgICAgJ3Z1ZS1yb3V0ZXInLFxuICAgICAgXSxcbiAgICAgIGVzbGludHJjOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgdnVlVGVtcGxhdGU6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIGRlZmluZTogeyAncHJvY2Vzcy5lbnYnOiB7fSB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgfSxcbiAgICBleHRlbnNpb25zOiBbXG4gICAgICAnLmpzJyxcbiAgICAgICcuanNvbicsXG4gICAgICAnLmpzeCcsXG4gICAgICAnLm1qcycsXG4gICAgICAnLnRzJyxcbiAgICAgICcudHN4JyxcbiAgICAgICcudnVlJyxcbiAgICBdLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICB9LFxuICBjc3M6IHtcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzYXNzOiB7XG4gICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sV0FBVztBQUNsQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sZUFBZTtBQUN0QixPQUFPLFdBQVcsMEJBQTBCO0FBRzVDLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLFNBQVMsZUFBZSxXQUFXO0FBWHFOLElBQU0sMkNBQTJDO0FBY3pTLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUMzQyxRQUFNLGFBQWEsSUFBSSxxQkFBcUI7QUFDNUMsTUFBSSxPQUFPO0FBQ1gsTUFBSTtBQUNGLFVBQU0sU0FBUyxJQUFJLElBQUksVUFBVTtBQUNqQyxXQUFPLE9BQU8sWUFBWTtBQUFBLEVBQzVCLFFBQVE7QUFDTixXQUFPLFdBQVcsV0FBVyxHQUFHLElBQUksYUFBYSxJQUFJLFVBQVU7QUFBQSxFQUNqRTtBQUNBLE1BQUksQ0FBQyxLQUFLLFNBQVMsR0FBRyxFQUFHLFFBQU8sR0FBRyxJQUFJO0FBRXZDLFNBQU87QUFBQSxJQUNQO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxVQUFVO0FBQUEsTUFDVixRQUFRO0FBQUEsTUFDUixJQUFJO0FBQUEsUUFDRixVQUFVLEVBQUUsbUJBQW1CO0FBQUEsTUFDakMsQ0FBQztBQUFBO0FBQUEsTUFFRCxRQUFRO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixRQUFRO0FBQUEsVUFDTixZQUFZO0FBQUEsUUFDZDtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsV0FBVztBQUFBLE1BQ1gsTUFBTTtBQUFBLFFBQ0osUUFBUTtBQUFBLFVBQ04sVUFBVSxDQUFDO0FBQUEsWUFDVCxNQUFNO0FBQUEsWUFDTixRQUFRO0FBQUEsVUFDVixDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsV0FBVztBQUFBLFFBQ1QsU0FBUztBQUFBLFVBQ1A7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLFFBQ0EsVUFBVTtBQUFBLFVBQ1IsU0FBUztBQUFBLFFBQ1g7QUFBQSxRQUNBLGFBQWE7QUFBQSxNQUNmLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxRQUFRLEVBQUUsZUFBZSxDQUFDLEVBQUU7QUFBQSxJQUM1QixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQ3REO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFVBQ0osS0FBSztBQUFBLFFBQ1A7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
