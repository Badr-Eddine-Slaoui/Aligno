<script setup lang="ts">
import type { BankAccount } from '~/types'
import { parseApiError } from '~/utils/errors'

const props = defineProps<{
  modelValue: boolean
  account?: BankAccount | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const wallet = useWallet()
const isEditing = computed(() => !!props.account)

const form = reactive({
  name: '',
  bankName: '',
  accountNumber: '',
  balance: 0,
  currency: 'MAD',
})

const errors = reactive<Record<string, string>>({})
const isLoading = ref(false)

watch(() => props.modelValue, (open) => {
  if (open) {
    form.name = props.account?.name ?? ''
    form.bankName = props.account?.bankName ?? ''
    form.accountNumber = props.account?.accountNumber ?? ''
    form.balance = props.account?.balance ?? 0
    form.currency = props.account?.currency ?? 'MAD'
    Object.keys(errors).forEach(k => delete errors[k])
  }
})

const submit = async () => {
  Object.keys(errors).forEach(k => delete errors[k])
  isLoading.value = true
  try {
    const payload = {
      name: form.name,
      bankName: form.bankName || undefined,
      accountNumber: form.accountNumber || undefined,
      balance: isEditing.value ? undefined : Number(form.balance),
      currency: form.currency,
    }
    if (isEditing.value && props.account) {
      await wallet.updateBankAccount(props.account.id, payload)
    } else {
      await wallet.createBankAccount(payload)
    }
    emit('update:modelValue', false)
    emit('saved')
  } catch (err: any) {
    const { errors: apiErrors } = parseApiError(err)
    if (apiErrors) {
      Object.entries(apiErrors).forEach(([key, msgs]) => {
        errors[key] = Array.isArray(msgs) ? msgs[0] : String(msgs)
      })
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AppModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :title="isEditing ? 'Edit Bank Account' : 'Create Bank Account'">
    <form @submit.prevent="submit" class="space-y-5">
      <AppInput v-model="form.name" label="Account Name" placeholder="e.g. CIH Main Account" :error="errors.name" required />
      <AppInput v-model="form.bankName" label="Bank Name" placeholder="e.g. CIH Bank" :error="errors.bankName" />
      <AppInput v-model="form.accountNumber" label="Account Number" placeholder="e.g. CIH-001" :error="errors.accountNumber" required />
      <AppInput v-if="!isEditing" v-model="form.balance" type="number" label="Initial Balance" placeholder="e.g. 5000" :error="errors.balance" />
      <AppInput v-model="form.currency" label="Currency (3 letters)" placeholder="MAD" :error="errors.currency" required />

      <div class="flex justify-end gap-3 pt-3 border-t border-white/5">
        <AppButton variant="ghost" @click="emit('update:modelValue', false)">Cancel</AppButton>
        <AppButton variant="solid" color="primary" type="submit" :loading="isLoading">
          {{ isEditing ? 'Save Changes' : 'Create Account' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
