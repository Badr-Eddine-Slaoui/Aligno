<script setup lang="ts">
interface Props {
  src?: string | null
  firstName?: string
  lastName?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  firstName: '',
  lastName: '',
  size: 'md',
})

const initials = computed(() => {
  const f = props.firstName.charAt(0) || ''
  const l = props.lastName.charAt(0) || ''
  return `${f}${l}`.toUpperCase() || 'U'
})
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center rounded-full overflow-hidden font-display font-semibold select-none border border-primary-container/20 text-primary-container bg-surface-container-high"
    :class="[
      size === 'sm' && 'w-8 h-8 text-xs',
      size === 'md' && 'w-10 h-10 text-sm',
      size === 'lg' && 'w-16 h-16 text-lg',
    ]"
  >
    <img
      v-if="src"
      :src="src"
      alt="User avatar"
      class="w-full h-full object-cover"
    />
    <span v-else>{{ initials }}</span>
  </div>
</template>
