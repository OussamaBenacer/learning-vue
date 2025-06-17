<script setup>
import { ref } from "vue";
import { loginApi, refreshApi } from "@/services/auth";
import { useRouter } from "vue-router";
import { onMounted } from "vue";

const isLoading = ref(false);
const router = useRouter();

// redirected to the admin panel if the refresh token is valid
onMounted(async () => {
  isLoading.value = true;
  try {
    await refreshApi();
    router.replace("/admin-panel");
  } catch (err) {
    console.error("refresh failed: ", err.message);
  } finally {
    isLoading.value = false;
  }
});

// handle the form logic
const email = ref("");
const password = ref("");
const errorMessage = ref("");

const usernameRules = [(v) => !!v || "The email is required"];
const passwordRules = [(v) => !!v || "The password is required"];

async function handleSubmit(e) {
  errorMessage.value = "";
  const { valid } = await e;
  if (!valid) return;

  isLoading.value = true;
  try {
    await loginApi(email.value, password.value);
    router.replace("/admin-panel");
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex items-center justify-center h-screen px-4 bg-slate-100">
    <v-card
      class="w-full max-w-md px-4 py-6 border border-gray-300 sm:p-8 rounded-xl"
      :loading="isLoading"
      :disabled="isLoading"
    >
      <h2 class="mb-4 text-2xl font-bold text-center sm:mb-6 sm:text-3xl">Login</h2>

      <v-form validate-on="submit" @submit.prevent="handleSubmit">
        <v-text-field
          v-model="email"
          label="email"
          type="email"
          :rules="usernameRules"
          required
          color="blue"
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          :rules="passwordRules"
          required
          color="blue"
        ></v-text-field>

        <p v-if="!!errorMessage" class="py-2 my-3 text-center text-red-500 bg-red-100 rounded-md">
          {{ errorMessage }}
        </p>

        <v-btn class="mt-4" type="submit" block color="blue"> Submit </v-btn>
      </v-form>
    </v-card>
  </div>
</template>
