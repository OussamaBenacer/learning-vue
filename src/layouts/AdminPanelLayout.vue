<script setup>
import { RouterView, useRouter } from "vue-router";
import { ref } from "vue";
import { onMounted } from "vue";
import { refreshApi } from "@/services/auth";

const router = useRouter();
const isLoading = ref(true);
const hasPermission = ref(false);

// redirected to the login view if tokens are not valid
onMounted(async () => {
  try {
    await refreshApi();
    hasPermission.value = true;
  } catch (err) {
    router.replace("/");
    console.error("refresh failed: ", err.message);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <v-card :loading="isLoading">
    <v-app>
      <v-layout v-if="hasPermission">
        <v-navigation-drawer app permanent width="210">
          <div class="flex flex-col h-full p-4">
            <h1 class="text-xl font-semibold mb-6 border-b-2 py-4 border-b-gray-300 text-center">
              Admin Panel
            </h1>

            <v-list nav>
              <v-list-item title="Profile" link to="/admin-panel/profile"></v-list-item>
              <v-list-item title="Users" link to="/admin-panel/users"></v-list-item>
              <v-list-item title="Products" link to="/admin-panel/products"></v-list-item>
              <v-list-item title="Categories" link to="/admin-panel/categories"></v-list-item>
            </v-list>
          </div>
        </v-navigation-drawer>

        <v-main>
          <div class="h-full px-10">
            <RouterView />
          </div>
        </v-main>
      </v-layout>
    </v-app>
  </v-card>
</template>
