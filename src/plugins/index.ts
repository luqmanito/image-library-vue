/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from "./vuetify";
import router from "../router";
import 'vue-toast-notification/dist/theme-bootstrap.css';
import ToastPlugin from "vue-toast-notification";
// Types
import type { App } from "vue";

export function registerPlugins(app: App) {
  app.use(ToastPlugin).use(vuetify).use(router);
}
