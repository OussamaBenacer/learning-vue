<script setup>
import { ref, reactive, onMounted } from "vue";
import { getCategories, addCategory, updateCategory, deleteCategory } from "../services/categories";

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
    const { data } = await getCategories();
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
};

const saveCategory = async () => {
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
        await updateCategory(dialog.selectedCategory.id, changedFields);
      }
    } else {
      await addCategory({ ...form.value });
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

const removeCategory = async (categoryId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this category?");
  if (!confirmDelete) return;

  loading.value = true;
  try {
    await deleteCategory(categoryId);
    await loadCategories();
  } catch (err) {
    console.error("Failed to delete category:", err);
    alert("Failed to delete category: " + (err?.response?.data?.message || err?.message));
  } finally {
    loading.value = false;
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
        <v-btn size="small" color="error" @click="removeCategory(item.id)"> delete </v-btn>
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

        <v-text-field v-model="form.name" label="Name"></v-text-field>
        <v-text-field v-model="form.image" label="Image URL"></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" variant="plain" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="saveCategory">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
