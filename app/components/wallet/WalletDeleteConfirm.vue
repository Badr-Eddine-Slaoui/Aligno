<script setup lang="ts">
defineProps<{
  modelValue: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <AppConfirmModal
    :model-value="modelValue"
    :loading="loading"
    title="Confirm Deletion"
    message="Are you sure you want to delete this resource? This action is permanent and cannot be undone."
    confirm-label="Delete"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="emit('confirm')"
  />
</template>
