<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiService } from '~/services/api'
import PasswordStrength from '~/components/ui/PasswordStrength.vue'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()
const apiService = useApiService()
const notifications = useNotifications()

const token = computed(() => route.query.token as string)

const form = ref({
  password: '',
  confirmPassword: '',
})

const errors = ref({
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)

const validateForm = () => {
  const errs = { password: '', confirmPassword: '' }
  const pwd = form.value.password
  
  if (!pwd) {
    errs.password = 'Password is required'
  } else {
    if (pwd.length < 8) errs.password = 'At least 8 characters required'
    else if (!/[A-Z]/.test(pwd)) errs.password = 'At least one uppercase letter required'
    else if (!/[a-z]/.test(pwd)) errs.password = 'At least one lowercase letter required'
    else if (!/[0-9]/.test(pwd)) errs.password = 'At least one number required'
    else if (!/[^A-Za-z0-9]/.test(pwd)) errs.password = 'At least one special character required'
  }

  if (form.value.confirmPassword !== form.value.password) {
    errs.confirmPassword = 'Passwords do not match'
  }

  errors.value = errs
  return !errs.password && !errs.confirmPassword
}

const onSubmit = async () => {
  if (!token.value) {
    notifications.error('Invalid or missing reset token')
    return
  }

  if (!validateForm()) {
    notifications.error('Please correct the validation errors')
    return
  }

  isLoading.value = true
  try {
    const res = await apiService.auth.resetPassword({
      token: token.value,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword,
    })
    if (res.success) {
      notifications.success('Password updated successfully!')
      await router.push('/login')
    }
  } catch (err: any) {
    notifications.error(err.statusMessage || 'Password reset request failed')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="animate-enter w-full max-w-md mx-auto">
    <AppCard class="w-full shadow-2xl border border-outline-variant/30 backdrop-blur-md bg-surface-container/60">
      <template #header v-if="token">
        <h2 class="font-display font-semibold text-2xl text-center text-primary-container tracking-tight">New Credentials</h2>
        <p class="text-xs text-on-surface-variant text-center mt-2 font-body">Provide a strong password replacement.</p>
      </template>

      <!-- Invalid or Missing Token State -->
      <div v-if="!token" class="flex flex-col gap-5 text-center py-6">
        <div class="w-16 h-16 mx-auto flex items-center justify-center bg-error/10 rounded-full border border-error/20">
          <svg class="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div class="space-y-2">
          <h2 class="font-display font-semibold text-xl text-error">Link Expired or Invalid</h2>
          <p class="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed font-body">
            This password reset link is invalid, expired, or has already been used. Please request a new link.
          </p>
        </div>

        <div class="mt-4">
          <NuxtLink to="/forgot-password" class="w-full py-3 px-4 bg-error-container text-on-error-container rounded-xl text-sm font-semibold block hover:bg-error/30 transition-colors">
            Request New Link
          </NuxtLink>
        </div>
      </div>

      <!-- Valid Form State -->
      <form v-else @submit.prevent="onSubmit" class="flex flex-col gap-4 mt-2">
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

        <PasswordStrength :password="form.password" class="mt-1" />

        <AppButton type="submit" :loading="isLoading" class="w-full mt-4 bg-primary-container text-on-primary-container glow-primary-hover hover:scale-[1.02] transition-transform duration-300">
          Reset Password
        </AppButton>
      </form>
    </AppCard>
  </div>
</template>

<style scoped>
@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-enter {
  animation: enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
