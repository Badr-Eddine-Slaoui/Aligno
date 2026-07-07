<script setup lang="ts">
useSeoMeta({ title: 'Verify Email – Aligno', description: 'Verify your email address to activate your Aligno account.' })
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiService } from '~/services/api'
import { parseApiError } from '~/utils/errors'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()
const apiService = useApiService()
const notifications = useNotifications()

const token = ref('')
const isLoading = ref(false)
const verificationStatus = ref<'idle' | 'verifying' | 'success' | 'error'>('idle')
const errorMessage = ref('')

const verifyCode = async () => {
  if (!token.value.trim()) {
    errorMessage.value = 'Verification token is required'
    return
  }
  
  isLoading.value = true
  verificationStatus.value = 'verifying'
  errorMessage.value = ''
  
  try {
    const res = await apiService.auth.verifyEmail({ token: token.value.trim() })
    if (res.success) {
      verificationStatus.value = 'success'
      notifications.success('Email validated successfully!')
    }
  } catch (err: any) {
    verificationStatus.value = 'error'
    const { message } = parseApiError(err)
    errorMessage.value = message
    notifications.error(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const queryToken = route.query.token as string
  if (queryToken) {
    token.value = queryToken
    verifyCode()
  }
})
</script>

<template>
  <div class="animate-enter w-full max-w-md mx-auto">
    <AppCard class="w-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/5 backdrop-blur-xl bg-surface-container/40 rounded-2xl relative overflow-hidden">
      <!-- Glow Line Border Accent -->
      <div class="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary-container/40 to-transparent" />
      
      <template #header v-if="verificationStatus === 'idle' || verificationStatus === 'error'">
        <div class="flex flex-col items-center gap-3">
          <div v-if="verificationStatus === 'error'" class="w-16 h-16 flex items-center justify-center bg-error/10 rounded-2xl border border-error/20">
            <svg class="w-8 h-8 text-error animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div class="text-center space-y-1 mt-2">
            <h2 class="font-display font-bold text-2xl text-on-surface tracking-tight">Confirm Email</h2>
            <p class="text-xs text-on-surface-variant font-body leading-relaxed max-w-xs mx-auto">
              {{ verificationStatus === 'error' ? 'The verification token provided was invalid or has expired.' : 'Provide verification credentials to validate identity.' }}
            </p>
          </div>
        </div>
      </template>

      <!-- Auto-verifying Loader -->
      <div v-if="verificationStatus === 'verifying'" class="flex flex-col items-center justify-center py-10 gap-4">
        <div class="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        <p class="font-display font-bold text-lg text-primary-container animate-pulse">Verifying Your Email</p>
        <p class="text-xs text-on-surface-variant font-body">Please wait while we check your verification credentials...</p>
      </div>

      <!-- Success View -->
      <div v-else-if="verificationStatus === 'success'" class="flex flex-col gap-6 text-center py-6">
        <div class="relative w-16 h-16 mx-auto flex items-center justify-center bg-primary-container/10 rounded-2xl border border-primary-container/20">
          <span class="absolute inset-0 rounded-2xl bg-primary-container/5 animate-ping"></span>
          <svg class="w-8 h-8 text-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div class="space-y-2">
          <h2 class="font-display font-bold text-2xl text-primary-container">Verification Complete</h2>
          <p class="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed font-body">
            Your email has been successfully validated. You can now access your Aligno workspace.
          </p>
        </div>

        <div class="mt-4">
          <NuxtLink to="/login" class="w-full py-3 px-4 bg-gradient-to-r from-primary-container to-inverse-primary text-on-primary-container rounded-xl text-sm font-semibold block hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-lg glow-primary">
            Sign In
          </NuxtLink>
        </div>
      </div>

      <!-- Error / Manual input state -->
      <div v-else class="flex flex-col gap-5 mt-2">
        <AppInput
          id="token"
          v-model="token"
          label="Verification Token / Code"
          type="text"
          placeholder="Enter verification code"
          :error="errorMessage"
          required
        />

        <AppButton @click="verifyCode" :loading="isLoading" class="w-full mt-2 bg-gradient-to-r from-primary-container to-inverse-primary text-on-primary-container glow-primary hover:glow-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 py-3">
          Validate Account
        </AppButton>
      </div>
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
