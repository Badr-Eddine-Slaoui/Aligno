<script setup lang="ts">
import { ref, computed } from 'vue'

const auth = useAuth()
const notifications = useNotifications()

const form = ref({
  firstName: auth.user.value?.firstName || '',
  lastName: auth.user.value?.lastName || '',
  email: auth.user.value?.email || '',
  phone: auth.user.value?.phone || '',
  age: auth.user.value?.age || null as number | null,
})

const errors = ref<Record<string, string>>({})
const isLoading = ref(false)
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(auth.user.value?.profilePictureUrl || null)

const memberSince = computed(() => {
  if (!auth.user.value?.createdAt) return 'Recent Member'
  const dateStr = auth.user.value.createdAt
  const date = new Date(dateStr)
  return `Member since ${date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`
})

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
  
  if (form.value.firstName) {
    if (form.value.firstName.trim().length < 2 || form.value.firstName.trim().length > 50) {
      errs.firstName = 'Must be between 2 and 50 characters'
    }
  }

  if (form.value.lastName) {
    if (form.value.lastName.trim().length < 2 || form.value.lastName.trim().length > 50) {
      errs.lastName = 'Must be between 2 and 50 characters'
    }
  }

  if (form.value.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
      errs.email = 'Invalid email address'
    }
  }

  if (form.value.phone) {
    if (!/^\+[1-9]\d{1,14}$/.test(form.value.phone)) {
      errs.phone = 'Must be E.164 format (e.g. +1234567890)'
    }
  }

  if (form.value.age !== null && form.value.age !== undefined && String(form.value.age).trim() !== '') {
    const ageNum = Number(form.value.age)
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      errs.age = 'Age must be between 13 and 120'
    }
  }

  errors.value = errs
  return Object.keys(errs).length === 0
}

const onSubmit = async () => {
  if (!validateForm()) {
    notifications.error('Please resolve validation errors')
    return
  }

  isLoading.value = true
  try {
    const formData = new FormData()
    if (form.value.firstName.trim()) formData.append('firstName', form.value.firstName.trim())
    if (form.value.lastName.trim()) formData.append('lastName', form.value.lastName.trim())
    if (form.value.email.trim()) formData.append('email', form.value.email.trim())
    if (form.value.phone.trim()) formData.append('phone', form.value.phone.trim())
    if (form.value.age !== null && form.value.age !== undefined && String(form.value.age).trim() !== '') {
      formData.append('age', String(form.value.age))
    }
    if (selectedFile.value) {
      formData.append('profilePicture', selectedFile.value)
    }

    const res = await auth.updateProfile(formData)
    if (res.success) {
      notifications.success('Profile updated successfully!')
      // Refresh local preview with backend url if updated
      if (res.data?.user?.profilePictureUrl) {
        imagePreview.value = res.data.user.profilePictureUrl
      }
      selectedFile.value = null
    }
  } catch (err: any) {
    if (err.data?.errors) {
      const apiErrors = err.data.errors
      Object.keys(apiErrors).forEach(key => {
        errors.value[key] = apiErrors[key][0]
      })
    } else {
      notifications.error(err.statusMessage || 'Failed to update profile')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight font-display text-primary">Profile Management</h1>
        <p class="text-xs text-on-surface-variant font-body">Manage your profile details, avatar, and credentials.</p>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Profile Header / Avatar Card -->
      <div class="md:col-span-1 space-y-4">
        <AppCard class="glass border border-outline-variant/30 text-center py-6 flex flex-col items-center gap-4">
          <div class="relative group cursor-pointer w-28 h-28 rounded-full overflow-hidden border border-outline-variant hover:border-primary-container transition-all">
            <!-- Loading Indicator overlay -->
            <div v-if="isLoading" class="absolute inset-0 bg-surface/75 flex items-center justify-center z-10">
              <div class="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <img 
              v-if="imagePreview" 
              :src="imagePreview" 
              class="w-full h-full object-cover" 
              alt="Profile avatar" 
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-surface-container-high text-primary-container text-2xl font-bold">
              {{ (auth.user.value?.firstName?.charAt(0) || '') + (auth.user.value?.lastName?.charAt(0) || '') }}
            </div>

            <!-- Upload Hover Overlay -->
            <label class="absolute inset-0 bg-surface/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer">
              <svg class="w-6 h-6 text-primary-container mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-[9px] uppercase tracking-wider font-semibold font-display text-primary-container">Change</span>
              <input type="file" accept="image/*" class="hidden" @change="onFileChange" />
            </label>
          </div>

          <div class="space-y-1">
            <h3 class="font-display font-semibold text-lg">{{ auth.user.value?.firstName }} {{ auth.user.value?.lastName }}</h3>
            <p class="text-xs text-on-surface-variant font-mono">{{ auth.user.value?.email }}</p>
            <p class="text-[10px] text-primary-container/80 font-semibold uppercase tracking-wider mt-1">{{ memberSince }}</p>
          </div>

          <div v-if="errors.profilePicture" class="text-xs text-error font-mono text-center px-4">{{ errors.profilePicture }}</div>
        </AppCard>
      </div>

      <!-- Account Settings Form Card -->
      <div class="md:col-span-2">
        <AppCard class="glass border border-outline-variant/30">
          <template #header>
            <h3 class="font-display font-semibold text-lg text-primary-container">Edit Profile Details</h3>
            <p class="text-xs text-on-surface-variant font-body">Update your personal account details below.</p>
          </template>

          <form @submit.prevent="onSubmit" class="space-y-5 mt-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AppInput
                id="firstName"
                v-model="form.firstName"
                label="First Name"
                placeholder="First name"
                :error="errors.firstName"
              />
              <AppInput
                id="lastName"
                v-model="form.lastName"
                label="Last Name"
                placeholder="Last name"
                :error="errors.lastName"
              />
            </div>

            <AppInput
              id="email"
              v-model="form.email"
              label="Email address"
              type="email"
              placeholder="user@example.com"
              :error="errors.email"
            />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AppInput
                id="phone"
                v-model="form.phone"
                label="Phone"
                placeholder="+1234567890"
                :error="errors.phone"
              />
              <AppInput
                id="age"
                v-model="form.age"
                label="Age"
                type="number"
                placeholder="Enter age"
                :error="errors.age"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <AppButton 
                type="submit" 
                :loading="isLoading" 
                class="bg-primary-container text-on-primary-container font-semibold px-6 hover:scale-[1.02] transition-transform duration-300"
              >
                Save Changes
              </AppButton>
            </div>
          </form>
        </AppCard>
      </div>

    </div>
  </div>
</template>
