<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'auth'
})

const auth = useAuth()
const notifications = useNotifications()
const route = useRoute()

const form = ref({
  email: '',
  password: '',
})

const errors = ref({
  email: '',
  password: '',
})

const isLoading = ref(false)

const onSubmit = async () => {
  errors.value = { email: '', password: '' }
  
  if (!form.value.email) errors.value.email = 'Email is required'
  if (!form.value.password) errors.value.password = 'Password is required'
  
  if (errors.value.email || errors.value.password) return

  isLoading.value = true
  try {
    const res = await auth.login(form.value)
    if (res?.success) {
      notifications.success('Logged in successfully!')
    }
  } catch (err: any) {
    if (err.statusCode === 403) {
      // Email not verified
      notifications.warning('Please verify your email address first.')
      errors.value.email = 'Email verification is pending. Check your inbox.'
    } else if (err.statusCode === 401) {
      notifications.error('Invalid email or password')
      errors.value.email = 'Invalid credentials'
      errors.value.password = 'Invalid credentials'
    } else if (err.data?.errors) {
      const apiErrors = err.data.errors
      if (apiErrors.email) errors.value.email = apiErrors.email[0]
      if (apiErrors.password) errors.value.password = apiErrors.password[0]
    } else {
      notifications.error(err.statusMessage || 'Invalid login details')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="animate-enter w-full max-w-md mx-auto">
    <AppCard class="w-full shadow-2xl border border-outline-variant/30 backdrop-blur-md bg-surface-container/60">
      <template #header>
        <h2 class="font-display font-semibold text-2xl text-center text-primary-container tracking-tight">Access Your Workspace</h2>
        <p class="text-xs text-on-surface-variant text-center mt-2 font-body">Provide your verified credentials to enter Aligno.</p>
      </template>

      <form @submit.prevent="onSubmit" class="flex flex-col gap-5 mt-4">
        <AppInput
          id="email"
          v-model="form.email"
          label="Email address"
          type="email"
          placeholder="e.g. user@example.com"
          :error="errors.email"
          required
        />

        <AppInput
          id="password"
          v-model="form.password"
          label="Password"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
          required
        />

        <div class="flex items-center justify-between mt-2 text-xs">
          <label class="flex items-center gap-2 text-on-surface-variant hover:text-on-surface cursor-pointer select-none">
            <input type="checkbox" class="rounded accent-primary-container" />
            <span>Remember me</span>
          </label>
          
          <NuxtLink to="/forgot-password" class="text-primary-container hover:underline font-semibold">
            Forgot Password?
          </NuxtLink>
        </div>

        <AppButton type="submit" :loading="isLoading" class="w-full mt-4 bg-primary-container text-on-primary-container glow-primary-hover hover:scale-[1.02] transition-transform duration-300">
          Authenticate
        </AppButton>
      </form>

      <template #footer>
        <p class="text-xs text-center text-on-surface-variant">
          New to Aligno?
          <NuxtLink to="/register" class="text-primary-container hover:underline font-semibold ml-1">
            Create Account
          </NuxtLink>
        </p>
      </template>
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
