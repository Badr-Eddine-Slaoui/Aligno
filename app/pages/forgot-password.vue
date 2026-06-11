<script setup lang="ts">
import { useApiService } from '~/services/api'

definePageMeta({
  layout: 'auth'
})

const apiService = useApiService()
const notifications = useNotifications()

const email = ref('')
const error = ref('')
const isLoading = ref(false)
const isSubmitted = ref(false)

const onSubmit = async () => {
  error.value = ''
  if (!email.value) {
    error.value = 'Email is required'
    return
  }

  isLoading.value = true
  try {
    await apiService.auth.forgotPassword(email.value)
    isSubmitted.value = true
    notifications.success('Password reset link sent!')
  } catch (err: any) {
    error.value = err.statusMessage || 'Failed to request password reset'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AppCard class="w-full">
    <template #header>
      <h2 class="font-display font-semibold text-xl text-center text-primary">Recover Password</h2>
      <p class="text-xs text-on-surface-variant text-center mt-1">We will email you details on resetting access.</p>
    </template>

    <div v-if="isSubmitted" class="flex flex-col gap-4 text-center py-4">
      <Icon name="heroicons:envelope-open" class="w-12 h-12 text-primary-container mx-auto" />
      <p class="text-sm">We've sent recovery details to <strong class="text-primary">{{ email }}</strong> if it is registered.</p>
      <NuxtLink to="/login" class="text-xs text-primary-container hover:underline mt-2 block">
        Return to Login
      </NuxtLink>
    </div>

    <form v-else @submit.prevent="onSubmit" class="flex flex-col gap-5">
      <AppInput
        id="email"
        v-model="email"
        label="Email address"
        type="email"
        placeholder="user@example.com"
        :error="error"
        required
      />

      <AppButton type="submit" :loading="isLoading" class="w-full mt-4">
        Send Link
      </AppButton>
    </form>

    <template #footer v-if="!isSubmitted">
      <p class="text-xs text-center text-on-surface-variant">
        Recall passwords?
        <NuxtLink to="/login" class="text-primary-container hover:underline font-semibold ml-1">
          Back to Login
        </NuxtLink>
      </p>
    </template>
  </AppCard>
</template>
