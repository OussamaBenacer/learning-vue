<script setup>
defineProps({
  modelValue: Boolean,
  title: { type: String, default: "Confirm" },
  content: { type: String, default: "Are you sure?" },
  buttonText: { type: String, default: "Ok" },
  color: { type: String, default: "error" },
  onAccept: Function,
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    max-width="400"
    persistent
  >
    <v-card :loading="isSending" :disabled="isSending">
      <v-card-title class="text-h6">{{ title }}</v-card-title>

      <v-card-text>
        <div class="mb-2">{{ content }}</div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="color" @click="onAccept">{{ buttonText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
