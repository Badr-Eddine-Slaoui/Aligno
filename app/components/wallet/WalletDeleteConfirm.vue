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
  <AppModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" title="Confirm Deletion">
    <div class="space-y-5">
      <!-- Danger icon + message -->
      <div class="flex gap-4 items-start p-4 rounded-xl bg-error-container/10 border border-error-container/20">
        <div class="p-2 rounded-lg bg-error-container/20 text-error shrink-0">
          <Icon name="heroicons:exclamation-triangle" class="w-5 h-5" />
        </div>
        <p class="text-sm text-on-surface-variant font-body leading-relaxed">
          Are you sure you want to delete this resource? This action is <span class="text-error font-semibold">permanent</span> and cannot be undone.
        </p>
      </div>
      <div class="flex justify-end gap-3 pt-3 border-t border-white/5">
        <AppButton variant="ghost" @click="emit('update:modelValue', false)">Cancel</AppButton>
        <AppButton variant="solid" color="error" @click="emit('confirm')" :loading="loading">Confirm Delete</AppButton>
      </div>
    </div>
  </AppModal>
</template>
