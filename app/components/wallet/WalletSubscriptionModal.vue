<script setup lang="ts">
import type { Subscription } from '~/types'
import { parseApiError } from '~/utils/errors'

const props = defineProps<{
  modelValue: boolean
  subscription?: Subscription | null
  bankAccountId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const wallet = useWallet()
const isEditing = computed(() => !!props.subscription)

const form = reactive({
  name: '',
  status: 'EXPENSE' as 'INCOME' | 'EXPENSE',
  amount: 0,
  category: '',
  paymentMethod: 'Credit Card',
  isPaid: false,
  startDate: new Date().toISOString().substring(0, 10),
  endDate: '',
})

const errors = reactive<Record<string, string>>({})
const isLoading = ref(false)

watch(() => props.modelValue, (open) => {
  if (open) {
    const s = props.subscription
    form.name = s?.name ?? ''
    form.status = s?.status ?? 'EXPENSE'
    form.amount = s?.amount ?? 0
    form.category = s?.category ?? ''
    form.paymentMethod = s?.paymentMethod ?? 'Credit Card'
    form.isPaid = s?.isPaid ?? false
    form.startDate = s ? new Date(s.startDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10)
    form.endDate = s?.endDate ? new Date(s.endDate).toISOString().substring(0, 10) : ''
    Object.keys(errors).forEach(k => delete errors[k])
  }
})

const submit = async () => {
  Object.keys(errors).forEach(k => delete errors[k])
  isLoading.value = true
  try {
    const payload = {
      name: form.name,
      status: form.status,
      amount: Number(form.amount),
      category: form.category,
      paymentMethod: form.paymentMethod,
      isPaid: form.isPaid,
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      bankAccountId: isEditing.value ? undefined : props.bankAccountId,
    }
    if (isEditing.value && props.subscription) {
      await wallet.updateSubscription(props.subscription.id, payload)
    } else {
      await wallet.createSubscription({ ...payload, bankAccountId: props.bankAccountId })
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
  <AppModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :title="isEditing ? 'Edit Subscription' : 'Add Subscription'">
    <form @submit.prevent="submit" class="space-y-5">
      <AppInput v-model="form.name" label="Name" placeholder="e.g. Netflix, Gym" :error="errors.name" required />

      <div class="flex flex-col gap-2">
        <label class="font-display font-medium text-xs tracking-wider uppercase text-on-surface-variant">Status Type</label>
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

      <AppInput v-model="form.amount" type="number" label="Recurring Amount" placeholder="e.g. 99" :error="errors.amount" required />
      <AppInput v-model="form.category" label="Category" placeholder="e.g. Entertainment, Health" :error="errors.category" required />
      <AppInput v-model="form.paymentMethod" label="Payment Method" placeholder="e.g. Credit Card, Direct Debit" :error="errors.paymentMethod" required />

      <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-white/5 cursor-pointer select-none" @click="form.isPaid = !form.isPaid">
        <div class="w-4 h-4 rounded border flex items-center justify-center transition-all"
          :class="form.isPaid ? 'bg-emerald-500 border-emerald-500' : 'bg-surface-container border-outline-variant'">
          <Icon v-if="form.isPaid" name="heroicons:check" class="w-3 h-3 text-white" />
        </div>
        <label class="text-xs uppercase font-mono tracking-wider text-on-surface-variant cursor-pointer">
          Mark as Paid for current cycle
        </label>
      </div>

      <AppInput v-model="form.startDate" type="date" label="Start Date" :error="errors.startDate" required />
      <AppInput v-model="form.endDate" type="date" label="End Date (Optional)" :error="errors.endDate" />

      <div class="flex justify-end gap-3 pt-3 border-t border-white/5">
        <AppButton variant="ghost" @click="emit('update:modelValue', false)">Cancel</AppButton>
        <AppButton variant="solid" color="primary" type="submit" :loading="isLoading">
          {{ isEditing ? 'Save' : 'Add' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
