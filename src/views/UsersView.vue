<script setup>
import { ref, reactive, onMounted } from "vue";
import { getUsers, addUser, updateUser, deleteUser } from "../services/users";

// State
const users = ref([]);
const loading = ref(false);

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
    const { data } = await getUsers();
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

const saveUser = async () => {
  dialog.isSending = true;
  dialog.errors = [];
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
        await updateUser(dialog.selectedUser.id, changedFields);
      }
    } else {
      await addUser({ ...form.value });
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

const removeUser = async (userId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  loading.value = true;
  try {
    await deleteUser(userId);
    await loadUsers();
  } catch (err) {
    console.error("Failed to delete user:", err);
    alert("Failed to delete user: " + (err?.response?.data?.message || err?.message));
  } finally {
    loading.value = false;
  }
};

onMounted(loadUsers);
</script>

<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card flat>
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
        <v-btn size="small" color="error" @click="removeUser(item.id)"> delete </v-btn>
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

        <v-text-field v-model="form.name" label="Name"></v-text-field>
        <v-text-field v-model="form.email" label="Email"></v-text-field>
        <v-text-field v-model="form.password" label="Password" type="password"></v-text-field>
        <v-text-field v-model="form.avatar" label="Avatar URL"></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" variant="plain" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="saveUser">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
