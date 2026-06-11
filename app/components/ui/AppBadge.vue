<script setup lang="ts">
interface Props {
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning'
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider select-none"
    :class="[
      color === 'primary' && 'bg-primary-container/10 text-primary-container border border-primary-container/20',
      color === 'secondary' && 'bg-secondary-container/10 text-secondary-container border border-secondary-container/20',
      color === 'error' && 'bg-error-container/10 text-error-container border border-error-container/20',
      color === 'success' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      color === 'warning' && 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    ]"
  >
    <slot />
  </span>
</template>
