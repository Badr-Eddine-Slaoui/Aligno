<script setup lang="ts">
const appUrl = useRuntimeConfig().public.appUrl

useSeoMeta({
  title: 'Forgot Password – Aligno',
  description: 'Reset your Aligno password to regain access to your workspace, projects, and finance tracking.',
  ogTitle: 'Forgot Password – Aligno',
  ogDescription: 'Recover your Aligno account password securely.',
  ogType: 'website',
  ogUrl: `${appUrl}/forgot-password`,
  ogImage: `${appUrl}/og-image.png`,
  ogImageWidth: '1200',
  ogImageHeight: '630',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Forgot Password – Aligno',
  twitterDescription: 'Recover your Aligno account password securely.',
  robots: 'noindex, nofollow',
})

useHead({
  link: [{ rel: 'canonical', href: `${appUrl}/forgot-password` }],
})
import { ref, onBeforeUnmount } from 'vue'
import { useApiService } from '~/services/api'
import { parseApiError } from '~/utils/errors'

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
    const { message } = parseApiError(err)
    error.value = message
    notifications.error(message)
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
          <h2 class="font-display font-bold text-2xl text-on-surface tracking-tight">Recover Password</h2>
          <p class="text-xs text-on-surface-variant font-body leading-relaxed max-w-xs mx-auto">We will email you details on resetting access.</p>
        </div>
      </template>

      <!-- Success State -->
      <div v-if="isSubmitted" class="flex flex-col gap-6 text-center py-6">
        <!-- SVG Envelope Icon with pulsing circle background -->
        <div class="relative w-16 h-16 mx-auto flex items-center justify-center bg-primary-container/10 rounded-2xl border border-primary-container/20">
          <span class="absolute inset-0 rounded-2xl bg-primary-container/5 animate-ping"></span>
          <svg class="w-8 h-8 text-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
          </svg>
        </div>
        
        <div class="space-y-2">
          <p class="text-sm text-on-surface font-body font-semibold">Check your email inbox</p>
          <p class="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
            We've sent recovery details to <strong class="text-on-surface font-mono font-medium">{{ email }}</strong>. Please follow the instructions in the email.
          </p>
        </div>

        <div class="flex flex-col gap-3 mt-4">
          <AppButton 
            @click="onSubmit" 
            :disabled="countdown > 0 || isLoading" 
            variant="ghost"
            class="w-full font-semibold py-3"
          >
            {{ countdown > 0 ? `Resend in ${countdown}s` : 'Resend Link' }}
          </AppButton>

          <NuxtLink to="/login" class="text-xs text-primary-container hover:text-primary hover:underline font-semibold block transition-colors mt-2">
            Return to Login
          </NuxtLink>
        </div>
      </div>

      <!-- Form State -->
      <form v-else @submit.prevent="onSubmit" class="flex flex-col gap-6 mt-4">
        <AppInput
          id="email"
          v-model="email"
          label="Email address"
          type="email"
          placeholder="user@example.com"
          :error="error"
          required
        />

        <AppButton type="submit" :loading="isLoading" class="w-full mt-4 bg-gradient-to-r from-primary-container to-inverse-primary text-on-primary-container glow-primary hover:glow-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 py-3">
          Send Link
        </AppButton>
      </form>

      <template #footer v-if="!isSubmitted">
        <p class="text-xs text-center text-on-surface-variant">
          Recall passwords?
          <NuxtLink to="/login" class="text-primary-container hover:text-primary hover:underline font-semibold ml-1.5 transition-colors">
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
