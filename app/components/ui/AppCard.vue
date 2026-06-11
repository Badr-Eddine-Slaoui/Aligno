<script setup lang="ts">
interface Props {
  hoverEffect?: boolean
}

withDefaults(defineProps<Props>(), {
  hoverEffect: false,
})
</script>

<template>
  <div
    class="glass rounded-xl p-8 transition-all duration-300"
    :class="[
      hoverEffect && 'glass-hover hover:scale-[1.02] cursor-pointer'
    ]"
  >
    <div v-if="$slots.header" class="border-b border-outline-variant pb-4 mb-6">
      <slot name="header" />
    </div>
    
    <div class="text-on-surface">
      <slot />
    </div>

    <div v-if="$slots.footer" class="border-t border-outline-variant pt-4 mt-6">
      <slot name="footer" />
    </div>
  </div>
</template>
