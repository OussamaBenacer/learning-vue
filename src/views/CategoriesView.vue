<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  getCategoriesApi,
  addCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "../services/categories";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

// State
const categories = ref([]);
const loading = ref(false);

const dialog = reactive({
  isOpen: false,
  isSending: false,
  editMode: false,
  selectedCategory: null,
  errors: [],
});

const form = ref({
  name: "",
  image: "",
});

const formFieldErrors = reactive({
  name: "",
  image: "",
});

// Table headers
const headers = [
  { title: "Image", key: "image", sortable: false, align: "center" },
  { title: "Name", key: "name" },
  { title: "Actions", key: "actions", sortable: false },
];

// Methods
const loadCategories = async () => {
  loading.value = true;
  try {
    const { data } = await getCategoriesApi();
    categories.value = data;
  } catch (error) {
    console.error("Failed to load categories:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    name: "",
    image: "",
  };
  dialog.errors = [];
};

const openDialog = (category = null) => {
  dialog.editMode = !!category;
  dialog.selectedCategory = category ? { ...category } : null;

  form.value = {
    name: category?.name ?? "",
    image: category?.image ?? "",
  };

  dialog.isOpen = true;
};

const closeDialog = () => {
  dialog.isOpen = false;
  resetForm();

  formFieldErrors.name = "";
  formFieldErrors.image = "";
  dialog.errors = [];
};

const validateForm = () => {
  let isValid = true;

  formFieldErrors.name = "";
  formFieldErrors.image = "";

  if (!form.value.name || form.value.name.trim().length < 3) {
    formFieldErrors.name = "Name is required and must be at least 3 characters.";
    isValid = false;
  }

  const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i;
  if (!form.value.image || !urlRegex.test(form.value.image.trim())) {
    formFieldErrors.image = "Image URL is required and must be a valid image URL.";
    isValid = false;
  }

  return isValid;
};

const saveCategory = async () => {
  if (!validateForm()) return;
  dialog.isSending = true;
  dialog.errors = [];
  try {
    if (dialog.editMode) {
      // diff
      const changedFields = {};
      for (const key in form.value) {
        if (form.value[key] !== dialog.selectedCategory[key]) {
          changedFields[key] = form.value[key];
        }
      }

      if (Object.keys(changedFields).length > 0) {
        await updateCategoryApi(dialog.selectedCategory.id, changedFields);
      }
    } else {
      await addCategoryApi({ ...form.value });
    }

    await loadCategories();
    closeDialog();
  } catch (err) {
    console.error("Failed to save category:", err);
    const errors = err?.response?.data?.message || err?.message;
    dialog.errors = typeof errors === "string" ? [errors] : errors;
  } finally {
    dialog.isSending = false;
  }
};

// Delete product & delete dialog

const deleteDialog = reactive({
  isOpen: false,
  selectedCategoryId: null,
  isDeleting: false,
  errors: [],
});

const openDeleteDialog = (categoryId) => {
  deleteDialog.isOpen = true;
  deleteDialog.selectedCategoryId = categoryId;
};

const closeDeleteDialog = () => {
  deleteDialog.isOpen = false;
  deleteDialog.selectedCategoryId = null;
  deleteDialog.errors = [];
};

const deleteCategory = async () => {
  const categoryId = deleteDialog.selectedCategoryId;
  if (categoryId) {
    deleteDialog.isDeleting = true;
    deleteDialog.errors = [];
    try {
      await deleteCategoryApi(categoryId);
      closeDeleteDialog();
      await loadCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      const errorMsgs = err?.response?.data?.message || err?.message;
      deleteDialog.errors = typeof errorMsgs == "string" ? [errorMsgs] : errorMsgs;
    } finally {
      deleteDialog.isDeleting = false;
    }
  }
};

onMounted(loadCategories);
</script>

<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card flat>
    <template v-slot:text>
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Category Management</h1>
        <v-btn color="primary" @click="openDialog()">Add Category</v-btn>
      </div>
    </template>

    <v-data-table
      title="Category management"
      :headers="headers"
      :items="categories"
      :loading="loading"
      loading-text="Loading categories..."
      hide-default-footer
      :items-per-page="-1"
    >
      <template v-slot:item.image="{ item }">
        <v-img
          aspect-ratio="1"
          :lazy-src="item.image"
          :src="item.image"
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
        <span class="text-h6">{{ dialog.editMode ? "Edit Category" : "Add Category" }}</span>
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
        ></v-text-field>
        <v-text-field
          v-model="form.image"
          label="Image URL"
          :error="!!formFieldErrors.image"
          :error-messages="formFieldErrors.image"
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-btn variant="plain" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="saveCategory">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ConfirmDialog
    v-model="deleteDialog.isOpen"
    title="Delete Category"
    content="Are you sure you want to delete this category?"
    confirm-text="delete"
    @confirm="deleteCategory"
    @discard="closeDeleteDialog"
    :is-sending="deleteDialog.isDeleting"
    color="error"
    :errors="deleteDialog.errors"
  />
</template>
