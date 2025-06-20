import LoginView from "@/views/LoginView.vue";
import UsersView from "@/views/UsersView.vue";
import ProductsView from "@/views/ProductsView.vue";
import ProfileView from "@/views/ProfileView.vue";
import CategoriesView from "@/views/CategoriesView.vue";
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
      component: AdminPanelLayout,
      children: [
        {
          path: "users",
          component: UsersView,
        },
        {
          path: "products",
          component: ProductsView,
        },
        {
          path: "profile",
          component: ProfileView,
        },
        {
          path: "categories",
          component: CategoriesView,
        },
      ],
    },
  ],
});

export default router;
