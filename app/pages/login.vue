<script setup lang="ts">
useSeoMeta({ title: 'Sign In – Aligno', description: 'Sign in to Aligno to manage your projects, time, and finances.' })
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { parseApiError } from '~/utils/errors'

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

const errors = reactive({
  email: '',
  password: '',
})

const isLoading = ref(false)

const onSubmit = async () => {
  errors.email = ''
  errors.password = ''
  
  if (!form.value.email) errors.email = 'Email is required'
  if (!form.value.password) errors.password = 'Password is required'
  
  if (errors.email || errors.password) return

  isLoading.value = true
  try {
    const res = await auth.login(form.value)
    if (res?.success) {
      notifications.success('Logged in successfully!')
    }
  } catch (err: any) {
    const { statusCode, message, errors: apiErrors } = parseApiError(err)

    if (statusCode === 403) {
      // Email not verified
      notifications.warning('Please verify your email address first.')
      errors.email = 'Email verification is pending. Check your inbox.'
    } else if (statusCode === 401) {
      notifications.error('Invalid email or password')
      errors.email = 'Invalid credentials'
      errors.password = 'Invalid credentials'
    } else if (apiErrors) {
      if (apiErrors.email) errors.email = apiErrors.email[0]
      if (apiErrors.password) errors.password = apiErrors.password[0]
      notifications.error('Validation failed. Please correct the fields.')
    } else {
      notifications.error(message)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="animate-enter w-full max-w-md mx-auto">
    <AppCard class="w-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/5 backdrop-blur-xl bg-surface-container/40 rounded-2xl relative overflow-hidden">
      <!-- Glow Line Border Accent -->
      <div class="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary-container/40 to-transparent" />
      
      <template #header>
        <div class="text-center space-y-1 mt-2">
          <h2 class="font-display font-bold text-2xl text-on-surface tracking-tight">Access Your Workspace</h2>
          <p class="text-xs text-on-surface-variant font-body leading-relaxed max-w-xs mx-auto">Provide your verified credentials to enter Aligno.</p>
        </div>
      </template>

      <form @submit.prevent="onSubmit" class="flex flex-col gap-6 mt-4">
        <AppInput
          id="email"
          v-model="form.email"
          label="Email address"
          type="email"
          placeholder="user@example.com"
          :error="errors.email"
          required
        />

        <div class="space-y-1">
          <AppInput
            id="password"
            v-model="form.password"
            label="Password"
            type="password"
            placeholder="••••••••"
            :error="errors.password"
            required
          />
        </div>

        <div class="flex items-center justify-between text-xs mt-1">
          <label class="flex items-center gap-2 text-on-surface-variant hover:text-on-surface cursor-pointer select-none transition-colors">
            <input type="checkbox" class="w-4 h-4 rounded border-outline-variant bg-surface-container-low accent-primary-container text-on-primary-container focus:ring-primary-container/20 cursor-pointer" />
            <span>Remember me</span>
          </label>
          
          <NuxtLink to="/forgot-password" class="text-primary-container hover:text-primary font-semibold transition-colors">
            Forgot Password?
          </NuxtLink>
        </div>

        <AppButton type="submit" :loading="isLoading" class="w-full mt-4 bg-gradient-to-r from-primary-container to-inverse-primary text-on-primary-container glow-primary hover:glow-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 py-3">
          Authenticate
        </AppButton>
      </form>

      <template #footer>
        <p class="text-xs text-center text-on-surface-variant">
          New to Aligno?
          <NuxtLink to="/register" class="text-primary-container hover:text-primary hover:underline font-semibold ml-1.5 transition-colors">
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
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-enter {
  animation: enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
