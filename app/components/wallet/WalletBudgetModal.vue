<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  currentAmount?: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: { amount: number; month: number; year: number }]
}>()

const form = reactive({
  amount: 0,
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
})

watch(() => props.modelValue, (open) => {
  if (open) {
    form.amount = props.currentAmount ?? 0
    form.month = new Date().getMonth() + 1
    form.year = new Date().getFullYear()
  }
})

const submit = () => {
  emit('submit', {
    amount: Number(form.amount),
    month: Number(form.month),
    year: Number(form.year),
  })
}
</script>

<template>
  <AppModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" title="Set Monthly Budget Limit">
    <form @submit.prevent="submit" class="space-y-5">
      <AppInput v-model="form.amount" type="number" label="Budget Limit Amount" placeholder="e.g. 5000" required />
      <div class="grid grid-cols-2 gap-4">
        <AppInput v-model="form.month" type="number" label="Month (1-12)" placeholder="1 – 12" required />
        <AppInput v-model="form.year" type="number" label="Year" :placeholder="String(new Date().getFullYear())" required />
      </div>
      <p class="text-[11px] font-mono text-on-surface-variant/60 -mt-2">
        Setting a budget for a past month will update any existing entry.
      </p>
      <div class="flex justify-end gap-3 pt-3 border-t border-white/5">
        <AppButton variant="ghost" @click="emit('update:modelValue', false)">Cancel</AppButton>
        <AppButton variant="solid" color="primary" type="submit" :loading="loading">Set Budget Limit</AppButton>
      </div>
    </form>
  </AppModal>
</template>
