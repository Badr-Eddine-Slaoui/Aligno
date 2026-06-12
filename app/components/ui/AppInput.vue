<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  error: '',
  required: false,
  disabled: false,
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

const showPassword = ref(false)
const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <label
      v-if="label"
      :for="id"
      class="font-display font-medium text-xs tracking-wider uppercase text-on-surface-variant"
    >
      {{ label }} <span v-if="required" class="text-error">*</span>
    </label>

    <div class="relative flex items-center">
      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        class="w-full bg-surface-container-low text-on-surface rounded-xl pl-4 pr-10 py-3 text-sm transition-all duration-300 border border-outline-variant focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          error ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant'
        ]"
      />
      <button
        v-if="type === 'password'"
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-3 text-on-surface-variant hover:text-on-surface focus:outline-none transition-colors"
      >
        <!-- Eye icon -->
        <svg v-if="showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <!-- Eye off icon -->
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858-.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        </svg>
      </button>
    </div>

    <p v-if="error" class="text-error text-xs font-mono mt-1 font-medium">
      {{ error }}
    </p>
  </div>
</template>
