<script setup>
import { ref, reactive, onMounted } from "vue";
import { getUsersApi, addUserApi, updateUserApi, deleteUserApi } from "../services/users";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

// State
const users = ref([]);
const loading = ref(false);

// dialog form for add and edit
const dialog = reactive({
  isOpen: false,
  isSending: false,
  editMode: false,
  selectedUser: null,
  errors: [],
});

const form = ref({
  name: "",
  email: "",
  password: "",
  avatar: "",
});

const formFieldErrors = reactive({
  name: "",
  email: "",
  password: "",
  avatar: "",
});

const deleteDialog = reactive({
  isOpen: false,
  selectedUserId: null,
  isDeleting: false,
  errors: [],
});

// Table headers
const headers = [
  { title: "Image", key: "avatar", sortable: false, align: "center" },
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Role", key: "role" },
  { title: "Actions", key: "actions", sortable: false },
];

// Methods
const loadUsers = async () => {
  loading.value = true;
  try {
    const { data } = await getUsersApi();
    users.value = data;
  } catch (error) {
    console.error("Failed to load users:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    name: "",
    email: "",
    password: "",
    avatar: "",
  };
  dialog.errors = [];

  formFieldErrors.name = "";
  formFieldErrors.email = "";
  formFieldErrors.password = "";
  formFieldErrors.avatar = "";
};

const openDialog = (user = null) => {
  dialog.editMode = !!user;
  dialog.selectedUser = user ? { ...user } : null;

  form.value = {
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: user?.password ?? "",
    avatar: user?.avatar ?? "",
  };

  dialog.isOpen = true;
};

const closeDialog = () => {
  dialog.isOpen = false;
  resetForm();
};

const validateForm = async () => {
  let isValid = true;

  formFieldErrors.name = "";
  formFieldErrors.email = "";
  formFieldErrors.password = "";
  formFieldErrors.avatar = "";

  // Name
  if (!form.value.name || form.value.name.trim().length === 0) {
    formFieldErrors.name = "Name should not be empty.";
    isValid = false;
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.value.email || form.value.email.trim().length === 0) {
    formFieldErrors.email = "Email should not be empty.";
    isValid = false;
  } else if (!emailRegex.test(form.value.email.trim())) {
    formFieldErrors.email = "Email must be a valid email address.";
    isValid = false;
  }

  // Password
  if (!form.value.password || form.value.password.trim().length === 0) {
    formFieldErrors.password = "Password should not be empty.";
    isValid = false;
  } else if (form.value.password.length < 4) {
    formFieldErrors.password = "Password must be longer than or equal to 4 characters.";
    isValid = false;
  } else {
    const passwordRegex = /^[A-Za-z0-9]+$/;
    if (!passwordRegex.test(form.value.password)) {
      formFieldErrors.password = "Password must contain only letters and numbers.";
      isValid = false;
    }
  }

  // Avatar
  if (!form.value.avatar || form.value.avatar.trim().length === 0) {
    formFieldErrors.avatar = "Avatar should not be empty.";
    isValid = false;
  } else {
    try {
      new URL(form.value.avatar.trim());
    } catch {
      formFieldErrors.avatar = "Avatar must be a URL address.";
      isValid = false;
    }
  }

  return isValid;
};

const saveUser = async () => {
  dialog.isSending = true;
  dialog.errors = [];

  const isValid = await validateForm();

  if (!isValid) {
    dialog.isSending = false;
    return;
  }

  try {
    if (dialog.editMode) {
      // diff
      const changedFields = {};
      for (const key in form.value) {
        if (form.value[key] !== dialog.selectedUser[key]) {
          changedFields[key] = form.value[key];
        }
      }

      if (Object.keys(changedFields).length > 0) {
        await updateUserApi(dialog.selectedUser.id, changedFields);
      }
    } else {
      await addUserApi({ ...form.value });
    }

    await loadUsers();
    closeDialog();
  } catch (err) {
    console.error("Failed to save user:", err);
    const errors = err?.response?.data?.message || err?.message;
    dialog.errors = typeof errors === "string" ? [errors] : errors;
  } finally {
    dialog.isSending = false;
  }
};

const openDeleteDialog = (userId) => {
  deleteDialog.isOpen = true;
  deleteDialog.selectedUserId = userId;
};

const closeDeleteDialog = () => {
  deleteDialog.isOpen = false;
  deleteDialog.selectedUserId = null;
  deleteDialog.errors = [];
};

const deleteUser = async () => {
  const userId = deleteDialog.selectedUserId;
  if (userId) {
    deleteDialog.isDeleting = true;
    deleteDialog.errors = [];

    try {
      await deleteUserApi(userId);
      closeDeleteDialog();
      await loadUsers();
    } catch (err) {
      const errorMsgs = err?.response?.data?.message || err?.message;
      deleteDialog.errors = typeof errorMsgs == "string" ? [errorMsgs] : errorMsgs;
    } finally {
      deleteDialog.isDeleting = false;
    }
  }
};

onMounted(loadUsers);
</script>

<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card flat class="pb-20">
    <template v-slot:text>
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">User Management</h1>
        <v-btn color="primary" @click="openDialog()">Add User</v-btn>
      </div>
    </template>

    <v-data-table
      title="User management"
      :headers="headers"
      :items="users"
      :loading="loading"
      loading-text="Loading users..."
      color="primary"
      :items-per-page="-1"
      hide-default-footer
    >
      <template v-slot:item.avatar="{ item }">
        <v-img
          aspect-ratio="1"
          :lazy-src="item.avatar"
          :src="item.avatar"
          class="rounded-md size-12 block mx-auto"
          cover
        ></v-img>
      </template>

      <template #item.actions="{ item }">
        <v-btn size="small" @click="openDialog(item)"> edit </v-btn>
        <v-btn size="small" color="error" @click="openDeleteDialog(item.id)"> delete </v-btn>
      </template>
    </v-data-table>
  </v-card>

  <!-- Add / Edit Dialog -->
  <v-dialog v-model="dialog.isOpen" max-width="500">
    <v-card :loading="dialog.isSending" :disabled="dialog.isSending">
      <v-card-title>
        <span class="text-h6">{{ dialog.editMode ? "Edit User" : "Add User" }}</span>
      </v-card-title>

      <v-card-text>
        <!-- Errors -->
        <ul v-if="dialog.errors?.length" class="text-red-500 text-sm mb-4">
          <li v-for="error in dialog.errors" :key="error">{{ error }}</li>
        </ul>

        <v-text-field
          v-model="form.name"
          label="Name"
          :error="!!formFieldErrors.name"
          :error-messages="formFieldErrors.name"
        />

        <v-text-field
          v-model="form.email"
          label="Email"
          :error="!!formFieldErrors.email"
          :error-messages="formFieldErrors.email"
        />

        <v-text-field
          v-model="form.password"
          label="Password"
          type="password"
          :error="!!formFieldErrors.password"
          :error-messages="formFieldErrors.password"
        />

        <v-text-field
          v-model="form.avatar"
          label="Avatar URL"
          :error="!!formFieldErrors.avatar"
          :error-messages="formFieldErrors.avatar"
        />
      </v-card-text>

      <v-card-actions>
        <v-btn variant="plain" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="saveUser">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Dialog -->
  <ConfirmDialog
    v-model="deleteDialog.isOpen"
    title="Delete User"
    content="Are you sure you want to delete this user?"
    confirm-text="delete"
    @confirm="deleteUser"
    @discard="closeDeleteDialog"
    :is-sending="deleteDialog.isDeleting"
    color="error"
    :errors="deleteDialog.errors"
  />
</template>
