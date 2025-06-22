<script setup>
const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: "Confirm" },
  content: { type: String, default: "Are you sure?" },
  confirmText: { type: String, default: "Confirm" },
  isSending: { type: Boolean, default: true },
  color: { type: String, default: "error" },
  discardText: { type: String, default: "Cancel" },
  onConfirm: Function,
  onDiscard: Function,
  errors: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue"]);

const close = () => {
  emit("update:modelValue", false);
  if (props.onDiscard) props.onDiscard();
};

const confirm = () => {
  if (props.onConfirm) props.onConfirm();
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    max-width="400"
  >
    <v-card :loading="isSending" :disabled="isSending">
      <v-card-title class="text-h6">{{ title }}</v-card-title>

      <v-card-text>
        <div class="mb-2">{{ content }}</div>

        <ul v-if="errors.length" class="text-red-500 text-sm mb-2 space-y-1">
          <li v-for="(error, index) in errors" :key="index">
            {{ error }}
          </li>
        </ul>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="plain" @click="close">{{ discardText }}</v-btn>
        <v-btn :color="color" @click="confirm">{{ confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
