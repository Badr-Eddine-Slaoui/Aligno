<script setup lang="ts">
import type { Transaction } from '~/types'
import { parseApiError } from '~/utils/errors'

const props = defineProps<{
  modelValue: boolean
  transaction?: Transaction | null
  bankAccountId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const wallet = useWallet()
const isEditing = computed(() => !!props.transaction)

const form = reactive({
  status: 'EXPENSE' as 'INCOME' | 'EXPENSE',
  amount: 0,
  category: '',
  description: '',
  date: new Date().toISOString().substring(0, 10),
})

const errors = reactive<Record<string, string>>({})
const isLoading = ref(false)

watch(() => props.modelValue, (open) => {
  if (open) {
    form.status = props.transaction?.status ?? 'EXPENSE'
    form.amount = props.transaction?.amount ?? 0
    form.category = props.transaction?.category ?? ''
    form.description = props.transaction?.description ?? ''
    form.date = props.transaction
      ? new Date(props.transaction.date).toISOString().substring(0, 10)
      : new Date().toISOString().substring(0, 10)
    Object.keys(errors).forEach(k => delete errors[k])
  }
})

const submit = async () => {
  Object.keys(errors).forEach(k => delete errors[k])
  isLoading.value = true
  try {
    const payload = {
      status: form.status,
      amount: Number(form.amount),
      category: form.category,
      description: form.description || undefined,
      date: new Date(form.date).toISOString(),
      bankAccountId: isEditing.value ? undefined : props.bankAccountId,
    }
    if (isEditing.value && props.transaction) {
      await wallet.updateTransaction(props.transaction.id, payload)
    } else {
      await wallet.createTransaction({ ...payload, bankAccountId: props.bankAccountId })
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
  <AppModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :title="isEditing ? 'Edit Transaction' : 'Add Transaction'">
    <form @submit.prevent="submit" class="space-y-5">
      <div class="flex flex-col gap-2">
        <label class="font-display font-medium text-xs tracking-wider uppercase text-on-surface-variant">Transaction Type</label>
        <div class="flex p-1 bg-surface-container-low rounded-xl border border-white/5">
          <button type="button" @click="form.status = 'EXPENSE'" class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-1.5"
            :class="form.status === 'EXPENSE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/20' : 'text-on-surface-variant hover:text-on-surface'">
            <Icon name="heroicons:arrow-trending-down" class="w-3.5 h-3.5" /> Expense
          </button>
          <button type="button" @click="form.status = 'INCOME'" class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-1.5"
            :class="form.status === 'INCOME' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'text-on-surface-variant hover:text-on-surface'">
            <Icon name="heroicons:arrow-trending-up" class="w-3.5 h-3.5" /> Income
          </button>
        </div>
        <p v-if="errors.status" class="text-error text-xs font-mono mt-1 font-medium">{{ errors.status }}</p>
      </div>

      <AppInput v-model="form.amount" type="number" label="Amount" placeholder="e.g. 1500" :error="errors.amount" required />
      <AppInput v-model="form.category" label="Category" placeholder="e.g. Salary, Utilities, Food" :error="errors.category" required />
      <AppInput v-model="form.description" label="Description / Notes" placeholder="e.g. Monthly internet subscription" :error="errors.description" />
      <AppInput v-model="form.date" type="date" label="Date" :error="errors.date" required />

      <div class="flex justify-end gap-3 pt-3 border-t border-white/5">
        <AppButton variant="ghost" @click="emit('update:modelValue', false)">Cancel</AppButton>
        <AppButton variant="solid" color="primary" type="submit" :loading="isLoading">
          {{ isEditing ? 'Save' : 'Add' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
