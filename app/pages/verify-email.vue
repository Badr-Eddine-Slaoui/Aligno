<script setup lang="ts">
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

const verifyCode = async () => {
  if (!token.value) return
  isLoading.value = true
  try {
    await apiService.auth.verifyEmail({ token: token.value })
    notifications.success('Email validated successfully! You can login now.')
    await router.push('/login')
  } catch (err: any) {
    notifications.error(err.statusMessage || 'Verification failed')
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
  <AppCard class="w-full">
    <template #header>
      <h2 class="font-display font-semibold text-xl text-center text-primary">Confirm Email</h2>
      <p class="text-xs text-on-surface-variant text-center mt-1">Provide verification credentials to validate identity.</p>
    </template>

    <div class="flex flex-col gap-5">
      <AppInput
        id="token"
        v-model="token"
        label="Validation Token / Code"
        type="text"
        placeholder="Enter verification code"
        required
      />

      <AppButton @click="verifyCode" :loading="isLoading" class="w-full mt-2">
        Validate Account
      </AppButton>
    </div>
  </AppCard>
</template>
