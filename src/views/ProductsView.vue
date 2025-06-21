<script setup>
import { ref, reactive, onMounted } from "vue";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../services/products";
import { getCategories } from "@/services/categories";

// State
const products = ref([]);
const categories = ref([]);
const loading = ref(false);

const dialog = reactive({
  isOpen: false,
  isSending: false,
  editMode: false,
  selectedProduct: null,
  errors: [],
});

const form = ref({
  title: "",
  price: 0,
  description: "",
  categoryId: "",
  images: "",
});

// Table headers
const headers = [
  { title: "Image", key: "images", sortable: false, align: "center" },
  { title: "Title", key: "title" },
  { title: "Category", key: "category.name" },
  { title: "Price", key: "price" },
  { title: "Description", key: "description" },
  { title: "Actions", key: "actions", sortable: false },
];

// Methods
const loadProducts = async () => {
  loading.value = true;
  try {
    const { data: productsData } = await getProducts();
    products.value = productsData;
    const { data: categoriesData } = await getCategories();
    categories.value = categoriesData;
  } catch (error) {
    console.error("Failed to load products:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    title: "",
    price: 0,
    description: "",
    categoryId: "",
    images: "",
  };
  dialog.errors = [];
};

const openDialog = (product = null) => {
  dialog.editMode = !!product;
  dialog.selectedProduct = product ? { ...product } : null;

  form.value = {
    title: product?.title ?? "",
    price: product?.price ?? 0,
    description: product?.description ?? "",
    categoryId: product?.category?.id ?? "",
    images: product?.images?.join(" , ") ?? "",
  };

  dialog.isOpen = true;
};

const closeDialog = () => {
  dialog.isOpen = false;
  resetForm();
};

const saveProduct = async () => {
  dialog.isSending = true;
  dialog.errors = [];
  try {
    const finalProduct = {
      title: form.value.title,
      price: Number(form.value.price),
      description: form.value.description,
      categoryId: form.value.categoryId,
      images: form.value.images.split(",").map((url) => url.trim()),
    };

    if (dialog.editMode) {
      const changedFields = {};
      for (const key in finalProduct) {
        if (key === "images") {
          const newImages = finalProduct.images.join(",");
          const oldImages = (dialog.selectedProduct?.images || []).join(",");
          if (newImages !== oldImages) {
            changedFields.images = finalProduct.images;
          }
          continue; 
        }


        if (finalProduct[key] != dialog.selectedProduct[key]) {
          changedFields[key] = finalProduct[key];
        }
      }
      await updateProduct(dialog.selectedProduct?.id, changedFields);
    } else {
      await addProduct(finalProduct);
    }

    await loadProducts();
    closeDialog();
  } catch (err) {
    console.error("Failed to save product:", err);
    const errors = err?.response?.data?.message || err?.message;
    dialog.errors = typeof errors === "string" ? [errors] : errors;
  } finally {
    dialog.isSending = false;
  }
};

const removeProduct = async (productId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  loading.value = true;
  try {
    await deleteProduct(productId);
    await loadProducts();
  } catch (err) {
    console.error("Failed to delete product:", err);
    alert("Failed to delete product: " + (err?.response?.data?.message || err?.message));
  } finally {
    loading.value = false;
  }
};

onMounted(loadProducts);
</script>

<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card flat>
    <template v-slot:text>
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Product Management</h1>
        <v-btn color="primary" @click="openDialog()">Add Product</v-btn>
      </div>
    </template>

    <v-data-table
      title="Product management"
      :headers="headers"
      :items="products"
      :loading="loading"
      loading-text="Loading products..."
    >
      <template v-slot:item.images="{ item }">
        <v-img
          aspect-ratio="1"
          :lazy-src="item.images[0]"
          :src="item.images[0]"
          class="rounded-md size-12 block mx-auto"
          cover
        ></v-img>
      </template>

      <template #item.actions="{ item }">
        <v-btn size="small" @click="openDialog(item)"> edit </v-btn>
        <v-btn size="small" color="error" @click="removeProduct(item.id)"> delete </v-btn>
      </template>
    </v-data-table>
  </v-card>

  <!-- Add / Edit Dialog -->
  <v-dialog v-model="dialog.isOpen" max-width="600">
    <v-card :loading="dialog.isSending" :disabled="dialog.isSending">
      <v-card-title>
        <span class="text-h6">{{ dialog.editMode ? "Edit Product" : "Add Product" }}</span>
      </v-card-title>

      <v-card-text>
        <!-- Errors -->
        <ul v-if="dialog.errors?.length" class="text-red-500 text-sm mb-4">
          <li v-for="error in dialog.errors" :key="error">{{ error }}</li>
        </ul>

        <v-text-field v-model="form.title" label="Title"></v-text-field>
        <v-text-field v-model="form.price" label="Price" type="number"></v-text-field>
        <v-textarea v-model="form.description" label="Description"></v-textarea>
        <v-select
          v-model="form.categoryId"
          :items="categories"
          item-title="name"
          item-value="id"
          label="Category"
        ></v-select>

        <v-textarea v-model="form.images" label="Images (comma separated URLs)"></v-textarea>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" variant="plain" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="saveProduct">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
