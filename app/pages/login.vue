<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const auth = useAuth()
const notifications = useNotifications()

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
    await auth.login(form.value)
    notifications.success('Logged in successfully!')
  } catch (err: any) {
    if (err.data?.errors) {
      // API validation errors map
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
  <AppCard class="w-full">
    <template #header>
      <h2 class="font-display font-semibold text-xl text-center text-primary">Access Your Workspace</h2>
      <p class="text-xs text-on-surface-variant text-center mt-1">Provide your verified credentials to enter Aligno.</p>
    </template>

    <form @submit.prevent="onSubmit" class="flex flex-col gap-5">
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
        
        <NuxtLink to="/forgot-password" class="text-primary-container hover:underline">
          Forgot Password?
        </NuxtLink>
      </div>

      <AppButton type="submit" :loading="isLoading" class="w-full mt-4">
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
</template>
