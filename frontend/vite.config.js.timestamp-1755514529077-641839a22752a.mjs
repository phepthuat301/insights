// vite.config.js
import vue from "file:///C:/Users/pc/Desktop/New%20folder/Hilab/insights/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/pc/Desktop/New%20folder/Hilab/insights/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import frappeui from "file:///C:/Users/pc/Desktop/New%20folder/Hilab/insights/node_modules/frappe-ui/vite/index.js";
import path from "path";
import { defineConfig } from "file:///C:/Users/pc/Desktop/New%20folder/Hilab/insights/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\Users\\pc\\Desktop\\New folder\\Hilab\\insights\\frontend";
var vite_config_default = defineConfig({
  plugins: [
    frappeui({
      frappeProxy: true,
      lucideIcons: true,
      jinjaBootData: true,
      buildConfig: false
    }),
    vue(),
    vueJsx()
  ],
  server: {
    allowedHosts: true
  },
  esbuild: { loader: "tsx" },
  resolve: {
    alias: {
      // https://github.com/vitejs/vite/discussions/16730#discussioncomment-13048825
      vue: "vue/dist/vue.esm-bundler.js",
      "@": path.resolve(__vite_injected_original_dirname, "src"),
      "tailwind.config.js": path.resolve(__vite_injected_original_dirname, "tailwind.config.js")
    }
  },
  build: {
    outDir: `../insights/public/frontend`,
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__vite_injected_original_dirname, "index.html"),
        insights_v2: path.resolve(__vite_injected_original_dirname, "index_v2.html")
      },
      output: {
        manualChunks: {
          "frappe-ui": ["frappe-ui"]
        }
      }
    }
  },
  optimizeDeps: {
    include: ["feather-icons", "showdown", "tailwind.config.js", "highlight.js/lib/core"]
  },
  define: {
    // enable hydration mismatch details in production build
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxwY1xcXFxEZXNrdG9wXFxcXE5ldyBmb2xkZXJcXFxcSGlsYWJcXFxcaW5zaWdodHNcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHBjXFxcXERlc2t0b3BcXFxcTmV3IGZvbGRlclxcXFxIaWxhYlxcXFxpbnNpZ2h0c1xcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcGMvRGVza3RvcC9OZXclMjBmb2xkZXIvSGlsYWIvaW5zaWdodHMvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xyXG5pbXBvcnQgZnJhcHBldWkgZnJvbSAnZnJhcHBlLXVpL3ZpdGUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG5cdHBsdWdpbnM6IFtcclxuXHRcdGZyYXBwZXVpKHtcclxuXHRcdFx0ZnJhcHBlUHJveHk6IHRydWUsXHJcblx0XHRcdGx1Y2lkZUljb25zOiB0cnVlLFxyXG5cdFx0XHRqaW5qYUJvb3REYXRhOiB0cnVlLFxyXG5cdFx0XHRidWlsZENvbmZpZzogZmFsc2UsXHJcblx0XHR9KSxcclxuXHRcdHZ1ZSgpLFxyXG5cdFx0dnVlSnN4KCksXHJcblx0XSxcclxuXHRzZXJ2ZXI6IHtcclxuXHRcdGFsbG93ZWRIb3N0czogdHJ1ZSxcclxuXHR9LFxyXG5cdGVzYnVpbGQ6IHsgbG9hZGVyOiAndHN4JyB9LFxyXG5cdHJlc29sdmU6IHtcclxuXHRcdGFsaWFzOiB7XHJcblx0XHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92aXRlanMvdml0ZS9kaXNjdXNzaW9ucy8xNjczMCNkaXNjdXNzaW9uY29tbWVudC0xMzA0ODgyNVxyXG5cdFx0XHR2dWU6ICd2dWUvZGlzdC92dWUuZXNtLWJ1bmRsZXIuanMnLFxyXG5cdFx0XHQnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcclxuXHRcdFx0J3RhaWx3aW5kLmNvbmZpZy5qcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICd0YWlsd2luZC5jb25maWcuanMnKSxcclxuXHRcdH0sXHJcblx0fSxcclxuXHRidWlsZDoge1xyXG5cdFx0b3V0RGlyOiBgLi4vaW5zaWdodHMvcHVibGljL2Zyb250ZW5kYCxcclxuXHRcdGVtcHR5T3V0RGlyOiB0cnVlLFxyXG5cdFx0c291cmNlbWFwOiB0cnVlLFxyXG5cdFx0cm9sbHVwT3B0aW9uczoge1xyXG5cdFx0XHRpbnB1dDoge1xyXG5cdFx0XHRcdG1haW46IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdpbmRleC5odG1sJyksXHJcblx0XHRcdFx0aW5zaWdodHNfdjI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdpbmRleF92Mi5odG1sJyksXHJcblx0XHRcdH0sXHJcblx0XHRcdG91dHB1dDoge1xyXG5cdFx0XHRcdG1hbnVhbENodW5rczoge1xyXG5cdFx0XHRcdFx0J2ZyYXBwZS11aSc6IFsnZnJhcHBlLXVpJ10sXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSxcclxuXHRcdH0sXHJcblx0fSxcclxuXHRvcHRpbWl6ZURlcHM6IHtcclxuXHRcdGluY2x1ZGU6IFsnZmVhdGhlci1pY29ucycsJ3Nob3dkb3duJywndGFpbHdpbmQuY29uZmlnLmpzJywnaGlnaGxpZ2h0LmpzL2xpYi9jb3JlJ10sXHJcblx0XHRcclxuXHR9LFxyXG5cdGRlZmluZToge1xyXG5cdFx0Ly8gZW5hYmxlIGh5ZHJhdGlvbiBtaXNtYXRjaCBkZXRhaWxzIGluIHByb2R1Y3Rpb24gYnVpbGRcclxuXHRcdF9fVlVFX1BST0RfSFlEUkFUSU9OX01JU01BVENIX0RFVEFJTFNfXzogJ3RydWUnLFxyXG5cdH0sXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1csT0FBTyxTQUFTO0FBQ3RYLE9BQU8sWUFBWTtBQUNuQixPQUFPLGNBQWM7QUFDckIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBSjdCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLFNBQVM7QUFBQSxJQUNSLFNBQVM7QUFBQSxNQUNSLGFBQWE7QUFBQSxNQUNiLGFBQWE7QUFBQSxNQUNiLGVBQWU7QUFBQSxNQUNmLGFBQWE7QUFBQSxJQUNkLENBQUM7QUFBQSxJQUNELElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxFQUNSO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxjQUFjO0FBQUEsRUFDZjtBQUFBLEVBQ0EsU0FBUyxFQUFFLFFBQVEsTUFBTTtBQUFBLEVBQ3pCLFNBQVM7QUFBQSxJQUNSLE9BQU87QUFBQTtBQUFBLE1BRU4sS0FBSztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQ2xDLHNCQUFzQixLQUFLLFFBQVEsa0NBQVcsb0JBQW9CO0FBQUEsSUFDbkU7QUFBQSxFQUNEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDZCxPQUFPO0FBQUEsUUFDTixNQUFNLEtBQUssUUFBUSxrQ0FBVyxZQUFZO0FBQUEsUUFDMUMsYUFBYSxLQUFLLFFBQVEsa0NBQVcsZUFBZTtBQUFBLE1BQ3JEO0FBQUEsTUFDQSxRQUFRO0FBQUEsUUFDUCxjQUFjO0FBQUEsVUFDYixhQUFhLENBQUMsV0FBVztBQUFBLFFBQzFCO0FBQUEsTUFDRDtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDYixTQUFTLENBQUMsaUJBQWdCLFlBQVcsc0JBQXFCLHVCQUF1QjtBQUFBLEVBRWxGO0FBQUEsRUFDQSxRQUFRO0FBQUE7QUFBQSxJQUVQLHlDQUF5QztBQUFBLEVBQzFDO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
