<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const auth = useAuth()
const notifications = useNotifications()
const router = useRouter()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  age: null as number | null,
})

const errors = ref<Record<string, string>>({})
const isLoading = ref(false)

const onSubmit = async () => {
  errors.value = {}
  
  if (!form.value.firstName) errors.value.firstName = 'First name is required'
  if (!form.value.lastName) errors.value.lastName = 'Last name is required'
  if (!form.value.email) errors.value.email = 'Email is required'
  if (!form.value.password) errors.value.password = 'Password is required'
  if (!form.value.phone) errors.value.phone = 'Phone is required'
  if (!form.value.age) errors.value.age = 'Age is required'
  
  if (Object.keys(errors.value).length > 0) return

  isLoading.value = true
  try {
    const res = await auth.register({
      ...form.value,
      age: Number(form.value.age),
    })
    notifications.success('Account created! Please check your email for validation link.')
    await router.push('/login')
  } catch (err: any) {
    if (err.data?.errors) {
      const apiErrors = err.data.errors
      Object.keys(apiErrors).forEach(key => {
        errors.value[key] = apiErrors[key][0]
      })
    } else {
      notifications.error(err.statusMessage || 'Registration failed')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AppCard class="w-full">
    <template #header>
      <h2 class="font-display font-semibold text-xl text-center text-primary">Join Aligno</h2>
      <p class="text-xs text-on-surface-variant text-center mt-1">Register to start organizing tasks & budgets.</p>
    </template>

    <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
      <div class="grid grid-cols-2 gap-4">
        <AppInput
          id="firstName"
          v-model="form.firstName"
          label="First Name"
          :error="errors.firstName"
          required
        />
        <AppInput
          id="lastName"
          v-model="form.lastName"
          label="Last Name"
          :error="errors.lastName"
          required
        />
      </div>

      <AppInput
        id="email"
        v-model="form.email"
        label="Email address"
        type="email"
        placeholder="user@example.com"
        :error="errors.email"
        required
      />

      <AppInput
        id="password"
        v-model="form.password"
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        :error="errors.password"
        required
      />

      <div class="grid grid-cols-2 gap-4">
        <AppInput
          id="phone"
          v-model="form.phone"
          label="Phone"
          placeholder="+212..."
          :error="errors.phone"
          required
        />
        <AppInput
          id="age"
          v-model="form.age"
          label="Age"
          type="number"
          placeholder="Min 13"
          :error="errors.age"
          required
        />
      </div>

      <AppButton type="submit" :loading="isLoading" class="w-full mt-4">
        Register Account
      </AppButton>
    </form>

    <template #footer>
      <p class="text-xs text-center text-on-surface-variant">
        Already have an account?
        <NuxtLink to="/login" class="text-primary-container hover:underline font-semibold ml-1">
          Sign In
        </NuxtLink>
      </p>
    </template>
  </AppCard>
</template>
