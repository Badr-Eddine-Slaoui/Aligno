<script setup lang="ts">
import { useApiService } from '~/services/api'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()
const apiService = useApiService()
const notifications = useNotifications()

const form = ref({
  password: '',
  confirmPassword: '',
})

const errors = ref({
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)

const onSubmit = async () => {
  errors.value = { password: '', confirmPassword: '' }
  
  if (!form.value.password) errors.value.password = 'Password is required'
  if (form.value.password.length < 8) errors.value.password = 'Password must be at least 8 characters'
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
  }

  if (errors.value.password || errors.value.confirmPassword) return

  const token = route.query.token as string
  if (!token) {
    notifications.error('Invalid or missing reset token')
    return
  }

  isLoading.value = true
  try {
    await apiService.auth.resetPassword({
      token,
      password: form.value.password,
    })
    notifications.success('Password updated successfully!')
    await router.push('/login')
  } catch (err: any) {
    notifications.error(err.statusMessage || 'Password reset request failed')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AppCard class="w-full">
    <template #header>
      <h2 class="font-display font-semibold text-xl text-center text-primary">New Credentials</h2>
      <p class="text-xs text-on-surface-variant text-center mt-1">Provide a strong password replacement.</p>
    </template>

    <form @submit.prevent="onSubmit" class="flex flex-col gap-5">
      <AppInput
        id="password"
        v-model="form.password"
        label="New Password"
        type="password"
        placeholder="••••••••"
        :error="errors.password"
        required
      />

      <AppInput
        id="confirmPassword"
        v-model="form.confirmPassword"
        label="Confirm New Password"
        type="password"
        placeholder="••••••••"
        :error="errors.confirmPassword"
        required
      />

      <AppButton type="submit" :loading="isLoading" class="w-full mt-4">
        Reset Password
      </AppButton>
    </form>
  </AppCard>
</template>
