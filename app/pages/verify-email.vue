<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiService } from '~/services/api'

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
    errorMessage.value = err.data?.message || err.statusMessage || 'Verification failed. The token may be expired or invalid.'
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
    <AppCard class="w-full shadow-2xl border border-outline-variant/30 backdrop-blur-md bg-surface-container/60">
      <template #header v-if="verificationStatus === 'idle' || verificationStatus === 'error'">
        <div class="flex flex-col items-center gap-3">
          <div v-if="verificationStatus === 'error'" class="w-12 h-12 flex items-center justify-center bg-error/10 rounded-full border border-error/20">
            <svg class="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 class="font-display font-semibold text-2xl text-center text-primary-container tracking-tight">Confirm Email</h2>
          <p class="text-xs text-on-surface-variant text-center leading-relaxed font-body">
            {{ verificationStatus === 'error' ? 'The verification token provided was invalid or has expired.' : 'Provide verification credentials to validate identity.' }}
          </p>
        </div>
      </template>

      <!-- Auto-verifying Loader -->
      <div v-if="verificationStatus === 'verifying'" class="flex flex-col items-center justify-center py-10 gap-4">
        <div class="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        <p class="font-display font-semibold text-lg text-primary-container">Verifying Your Email</p>
        <p class="text-xs text-on-surface-variant font-body">Please wait while we check your verification credentials...</p>
      </div>

      <!-- Success View -->
      <div v-else-if="verificationStatus === 'success'" class="flex flex-col gap-6 text-center py-6">
        <div class="relative w-16 h-16 mx-auto flex items-center justify-center bg-primary-container/10 rounded-full border border-primary-container/20">
          <span class="absolute inset-0 rounded-full bg-primary-container/5 animate-ping"></span>
          <svg class="w-8 h-8 text-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div class="space-y-2">
          <h2 class="font-display font-semibold text-2xl text-primary-container">Verification Complete</h2>
          <p class="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed font-body">
            Your email has been successfully validated. You can now access your Aligno workspace.
          </p>
        </div>

        <div class="mt-4">
          <NuxtLink to="/login" class="w-full py-3 px-4 bg-primary-container text-on-primary-container rounded-xl text-sm font-semibold block hover:scale-[1.02] transition-transform duration-300 shadow-lg glow-primary">
            Sign In
          </NuxtLink>
        </div>
      </div>

      <!-- Error / Manual input state -->
      <div v-else class="flex flex-col gap-4 mt-2">
        <AppInput
          id="token"
          v-model="token"
          label="Verification Token / Code"
          type="text"
          placeholder="Enter verification code"
          :error="errorMessage"
          required
        />

        <AppButton @click="verifyCode" :loading="isLoading" class="w-full mt-2 bg-primary-container text-on-primary-container glow-primary-hover hover:scale-[1.02] transition-transform duration-300">
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
