import LoginView from "@/views/LoginView.vue";
import AdminPanelLayout from "../layouts/AdminPanelLayout.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: LoginView,
    },
    {
      path: "/admin-panel",
      component: AdminPanelLayout ,
    },
  ],
});

export default router;
