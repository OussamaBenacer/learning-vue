<script setup>
import { RouterView, useRouter } from "vue-router";
import { ref } from "vue";
import { onMounted } from "vue";
import { getProfile } from "@/services/auth";
import { logoutApi } from "@/services/auth";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const router = useRouter();
const userProfile = ref(null);
const isLoading = ref(true);
const logoutDialog = ref(false);

const logout = async () => {
  // create full logic (consider the endpoint exist)
  try {
    await logoutApi();
    router.push("/");
  } catch (err) {
    console.err("failed logout: ", err.message);
  }
};

// redirected if we can't get user's profile (invalid access and refresh token)
onMounted(async () => {
  try {
    const { data } = await getProfile();
    userProfile.value = data;
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
      <v-layout v-if="!!userProfile">
        <v-app-bar title="Admin Panel">
          <div class="px-4 py-10">
            <div class="flex gap-3 items-center">
              <v-img
                :lazy-src="userProfile?.avatar"
                :src="userProfile?.avatar"
                class="rounded-full aspect-square grow-0 size-12 mx-auto"
                cover
              ></v-img>
              <div>
                <p class="font-semibold">
                  {{ userProfile?.name }}
                </p>
                <p class="text-xs text-slate-400">{{ userProfile?.email }}</p>
              </div>
              <v-btn variant="text" color="red" @click="logoutDialog = true"> logout </v-btn>
            </div>
          </div>
        </v-app-bar>
        <v-navigation-drawer width="250">
          <v-list nav class="px-4">
            <v-list-item title="Users" link to="/admin-panel/users"></v-list-item>
            <v-list-item title="Categories" link to="/admin-panel/categories"></v-list-item>
            <v-list-item title="Products" link to="/admin-panel/products"></v-list-item>
          </v-list>
        </v-navigation-drawer>

        <v-main>
          <div class="h-full">
            <RouterView />
          </div>
        </v-main>
      </v-layout>
    </v-app>
  </v-card>

  <ConfirmDialog
    v-model="logoutDialog"
    title="Logout"
    content="Are you sure you want logout"
    confirm-text="Logout"
    @confirm="logout"
    color="error"
  />
</template>
