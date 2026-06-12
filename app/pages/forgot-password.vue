<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
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
const countdown = ref(0)
let timer: NodeJS.Timeout | null = null

const startCountdown = () => {
  countdown.value = 60
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      if (timer) clearInterval(timer)
    }
  }, 1000)
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

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
    startCountdown()
  } catch (err: any) {
    error.value = err.statusMessage || 'Failed to request password reset'
    notifications.error(error.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="animate-enter w-full max-w-md mx-auto">
    <AppCard class="w-full shadow-2xl border border-outline-variant/30 backdrop-blur-md bg-surface-container/60">
      <template #header>
        <h2 class="font-display font-semibold text-2xl text-center text-primary-container tracking-tight">Recover Password</h2>
        <p class="text-xs text-on-surface-variant text-center mt-2 font-body">We will email you details on resetting access.</p>
      </template>

      <!-- Success State -->
      <div v-if="isSubmitted" class="flex flex-col gap-5 text-center py-6">
        <!-- SVG Envelope Icon with pulsing circle background -->
        <div class="relative w-16 h-16 mx-auto flex items-center justify-center bg-primary-container/10 rounded-full border border-primary-container/20">
          <span class="absolute inset-0 rounded-full bg-primary-container/5 animate-ping"></span>
          <svg class="w-8 h-8 text-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
          </svg>
        </div>
        
        <div class="space-y-2">
          <p class="text-sm text-on-surface font-body font-medium">Check your email inbox</p>
          <p class="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
            We've sent recovery details to <strong class="text-on-surface font-mono">{{ email }}</strong>. Please follow the instructions in the email.
          </p>
        </div>

        <div class="flex flex-col gap-3 mt-4">
          <AppButton 
            @click="onSubmit" 
            :disabled="countdown > 0 || isLoading" 
            variant="secondary"
            class="w-full bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest transition-colors font-semibold"
          >
            {{ countdown > 0 ? `Resend in ${countdown}s` : 'Resend Link' }}
          </AppButton>

          <NuxtLink to="/login" class="text-xs text-primary-container hover:underline font-semibold block transition-colors">
            Return to Login
          </NuxtLink>
        </div>
      </div>

      <!-- Form State -->
      <form v-else @submit.prevent="onSubmit" class="flex flex-col gap-5 mt-4">
        <AppInput
          id="email"
          v-model="email"
          label="Email address"
          type="email"
          placeholder="user@example.com"
          :error="error"
          required
        />

        <AppButton type="submit" :loading="isLoading" class="w-full mt-4 bg-primary-container text-on-primary-container glow-primary-hover hover:scale-[1.02] transition-transform duration-300">
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
