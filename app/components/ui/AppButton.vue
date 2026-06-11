<script setup lang="ts">
interface Props {
  variant?: 'solid' | 'ghost' | 'outline' | 'text'
  color?: 'primary' | 'secondary' | 'error'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'solid',
  color: 'primary',
  loading: false,
  disabled: false,
  type: 'button',
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="relative inline-flex items-center justify-center font-display font-semibold transition-all duration-300 rounded-xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary-container disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]"
    :class="[
      variant === 'solid' && color === 'primary' && 'bg-gradient-to-r from-primary-container to-inverse-primary text-on-primary-container glow-primary hover:glow-primary-hover hover:scale-[1.01]',
      variant === 'solid' && color === 'secondary' && 'bg-secondary-container text-on-secondary-container hover:bg-opacity-80',
      variant === 'solid' && color === 'error' && 'bg-error-container text-on-error-container hover:bg-opacity-80',
      variant === 'ghost' && 'glass text-on-surface hover:glass-hover hover:text-primary-container',
      variant === 'outline' && 'border border-primary-container text-primary-container hover:bg-primary-container hover:text-on-primary-container hover:glow-primary',
      variant === 'text' && 'text-on-surface hover:text-primary-container',
    ]"
  >
    <span v-if="loading" class="mr-2 animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
    <slot />
  </button>
</template>
