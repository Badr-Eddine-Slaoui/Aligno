<script setup lang="ts">
import type { BankAccount } from '~/types'

const props = defineProps<{
  modelValue: boolean
  account?: BankAccount | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: {
    name: string
    bankName?: string
    accountNumber?: string
    balance?: number
    currency: string
  }]
}>()

const isEditing = computed(() => !!props.account)

const form = reactive({
  name: '',
  bankName: '',
  accountNumber: '',
  balance: 0,
  currency: 'MAD',
})

watch(() => props.modelValue, (open) => {
  if (open) {
    form.name = props.account?.name ?? ''
    form.bankName = props.account?.bankName ?? ''
    form.accountNumber = props.account?.accountNumber ?? ''
    form.balance = props.account?.balance ?? 0
    form.currency = props.account?.currency ?? 'MAD'
  }
})

const submit = () => {
  emit('submit', {
    name: form.name,
    bankName: form.bankName || undefined,
    accountNumber: form.accountNumber || undefined,
    balance: isEditing.value ? undefined : Number(form.balance),
    currency: form.currency,
  })
}
</script>

<template>
  <AppModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :title="isEditing ? 'Edit Bank Account' : 'Create Bank Account'">
    <form @submit.prevent="submit" class="space-y-5">
      <AppInput v-model="form.name" label="Account Name" placeholder="e.g. CIH Main Account" required />
      <AppInput v-model="form.bankName" label="Bank Name" placeholder="e.g. CIH Bank" />
      <AppInput v-model="form.accountNumber" label="Account Number" placeholder="e.g. CIH-001" required />
      <AppInput v-if="!isEditing" v-model="form.balance" type="number" label="Initial Balance" placeholder="e.g. 5000" />
      <AppInput v-model="form.currency" label="Currency (3 letters)" placeholder="MAD" required />

      <div class="flex justify-end gap-3 pt-3 border-t border-white/5">
        <AppButton variant="ghost" @click="emit('update:modelValue', false)">Cancel</AppButton>
        <AppButton variant="solid" color="primary" type="submit" :loading="loading">
          {{ isEditing ? 'Save Changes' : 'Create Account' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
