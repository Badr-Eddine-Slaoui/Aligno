<script setup lang="ts">
import { ref } from 'vue'
import PasswordStrength from '~/components/ui/PasswordStrength.vue'
import { parseApiError } from '~/utils/errors'

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
  confirmPassword: '',
  phone: '',
  age: null as number | null,
  acceptTerms: false,
})

const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const errors = ref<Record<string, string>>({})
const isLoading = ref(false)

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (file.size > 2 * 1024 * 1024) {
      errors.value.profilePicture = 'Image must be less than 2MB'
      return
    }
    selectedFile.value = file
    errors.value.profilePicture = ''
    
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const validateForm = () => {
  const errs: Record<string, string> = {}
  
  if (!form.value.firstName.trim()) {
    errs.firstName = 'First name is required'
  } else if (form.value.firstName.length < 2 || form.value.firstName.length > 50) {
    errs.firstName = 'Must be between 2 and 50 characters'
  }

  if (!form.value.lastName.trim()) {
    errs.lastName = 'Last name is required'
  } else if (form.value.lastName.length < 2 || form.value.lastName.length > 50) {
    errs.lastName = 'Must be between 2 and 50 characters'
  }

  if (!form.value.email) {
    errs.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errs.email = 'Invalid email address'
  }

  if (!form.value.phone) {
    errs.phone = 'Phone number is required'
  } else if (!/^\+[1-9]\d{1,14}$/.test(form.value.phone)) {
    errs.phone = 'Must be E.164 format (e.g. +1234567890)'
  }

  if (form.value.age === null) {
    errs.age = 'Age is required'
  } else {
    const ageNum = Number(form.value.age)
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      errs.age = 'Age must be between 13 and 120'
    }
  }

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

  if (!form.value.acceptTerms) {
    errs.acceptTerms = 'You must accept the terms & conditions'
  }

  errors.value = errs
  return Object.keys(errs).length === 0
}

const onSubmit = async () => {
  if (!validateForm()) {
    notifications.error('Please correct the validation errors')
    return
  }
  
  isLoading.value = true
  try {
    const formData = new FormData()
    formData.append('firstName', form.value.firstName.trim())
    formData.append('lastName', form.value.lastName.trim())
    formData.append('email', form.value.email.trim())
    formData.append('phone', form.value.phone.trim())
    formData.append('password', form.value.password)
    formData.append('confirmPassword', form.value.confirmPassword)
    formData.append('age', String(form.value.age))
    if (selectedFile.value) {
      formData.append('profilePicture', selectedFile.value)
    }

    const res = await auth.register(formData)
    if (res.success) {
      notifications.success('Account created! Check email for verification link.')
      await router.push('/login')
    }
  } catch (err: any) {
    const { message, errors: apiErrors } = parseApiError(err)
    if (apiErrors) {
      Object.keys(apiErrors).forEach(key => {
        errors.value[key] = apiErrors[key][0]
      })
      notifications.error('Please correct the validation errors')
    } else {
      notifications.error(message)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="animate-enter w-full max-w-md mx-auto py-2">
    <AppCard class="w-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/5 backdrop-blur-xl bg-surface-container/40 rounded-2xl relative overflow-hidden">
      <!-- Glow Line Border Accent -->
      <div class="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary-container/40 to-transparent" />
      
      <template #header>
        <div class="text-center space-y-1 mt-2">
          <h2 class="font-display font-bold text-2xl text-on-surface tracking-tight">Join Aligno</h2>
          <p class="text-xs text-on-surface-variant font-body leading-relaxed max-w-xs mx-auto">Register to start organizing tasks & budgets.</p>
        </div>
      </template>

      <form @submit.prevent="onSubmit" class="flex flex-col gap-5 mt-2">
        
        <!-- Profile Picture Upload -->
        <div class="flex flex-col items-center gap-2 mb-1">
          <label class="relative group cursor-pointer flex flex-col items-center">
            <div class="w-20 h-20 rounded-full border-2 border-dashed border-outline-variant/60 overflow-hidden flex items-center justify-center bg-surface-container-low transition-all duration-300 group-hover:border-primary-container group-hover:bg-surface-container-high/40 shadow-inner">
              <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" alt="Profile preview" />
              <div v-else class="text-on-surface-variant/75 group-hover:text-primary-container flex flex-col items-center justify-center p-2 text-center transition-colors">
                <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <input type="file" accept="image/*" class="hidden" @change="onFileChange" />
            <span class="text-[9px] text-on-surface-variant/80 mt-1.5 group-hover:text-on-surface transition-colors font-mono tracking-widest uppercase">Avatar (Optional)</span>
          </label>
          <span v-if="errors.profilePicture" class="text-xs text-error font-mono font-medium">{{ errors.profilePicture }}</span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <AppInput
            id="firstName"
            v-model="form.firstName"
            label="First Name"
            placeholder="John"
            :error="errors.firstName"
            required
          />
          <AppInput
            id="lastName"
            v-model="form.lastName"
            label="Last Name"
            placeholder="Doe"
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

        <div class="grid grid-cols-2 gap-4">
          <AppInput
            id="phone"
            v-model="form.phone"
            label="Phone"
            placeholder="+1234567890"
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

        <div class="grid grid-cols-2 gap-4">
          <AppInput
            id="password"
            v-model="form.password"
            label="Password"
            type="password"
            placeholder="••••••••"
            :error="errors.password"
            required
          />
          <AppInput
            id="confirmPassword"
            v-model="form.confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            :error="errors.confirmPassword"
            required
          />
        </div>

        <!-- Password Strength Tracker -->
        <PasswordStrength :password="form.password" class="mt-1" />

        <!-- Accept Terms Checkbox -->
        <div class="flex flex-col gap-1 mt-2">
          <label class="flex items-start gap-3 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer select-none">
            <input 
              type="checkbox" 
              v-model="form.acceptTerms" 
              class="w-4 h-4 rounded border-outline-variant bg-surface-container-low accent-primary-container text-on-primary-container focus:ring-primary-container/20 cursor-pointer mt-0.5"
              required 
            />
            <span class="leading-relaxed font-body">I agree to the <a href="#" class="text-primary-container hover:text-primary hover:underline font-semibold transition-colors">Terms of Service</a> and <a href="#" class="text-primary-container hover:text-primary hover:underline font-semibold transition-colors">Privacy Policy</a>.</span>
          </label>
          <span v-if="errors.acceptTerms" class="text-xs text-error font-mono font-medium">{{ errors.acceptTerms }}</span>
        </div>

        <AppButton type="submit" :loading="isLoading" class="w-full mt-3 bg-gradient-to-r from-primary-container to-inverse-primary text-on-primary-container glow-primary hover:glow-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 py-3">
          Register Account
        </AppButton>
      </form>

      <template #footer>
        <p class="text-xs text-center text-on-surface-variant">
          Already have an account?
          <NuxtLink to="/login" class="text-primary-container hover:text-primary hover:underline font-semibold ml-1.5 transition-colors">
            Sign In
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
