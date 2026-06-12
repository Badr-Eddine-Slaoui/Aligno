<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  password?: string
}>()

const requirements = computed(() => {
  const pwd = props.password || ''
  return [
    { label: 'At least 8 characters', met: pwd.length >= 8 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(pwd) },
    { label: 'At least one lowercase letter', met: /[a-z]/.test(pwd) },
    { label: 'At least one number', met: /[0-9]/.test(pwd) },
    { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(pwd) }
  ]
})

const score = computed(() => {
  return requirements.value.filter(req => req.met).length
})

const strengthText = computed(() => {
  const s = score.value
  if (s === 0) return 'Very Weak'
  if (s <= 2) return 'Weak'
  if (s <= 4) return 'Medium'
  return 'Strong'
})

const barColorClass = computed(() => {
  const s = score.value
  if (s <= 2) return 'bg-error'
  if (s <= 4) return 'bg-secondary' // orange/yellow equivalent in the palette, or secondary
  return 'bg-primary-container' // green/blue/cyan accent
})
</script>

<template>
  <div class="space-y-3 p-4 bg-surface-container/40 border border-outline-variant/30 rounded-xl">
    <div class="flex justify-between items-center text-xs font-medium">
      <span class="text-on-surface-variant font-display uppercase tracking-wider">Password Strength</span>
      <span :class="[
        score <= 2 ? 'text-error' : score <= 4 ? 'text-secondary-container text-on-secondary-container' : 'text-primary-container'
      ]" class="font-mono">{{ strengthText }}</span>
    </div>

    <!-- Progress bars -->
    <div class="grid grid-cols-5 gap-1.5 h-1.5 w-full">
      <div
        v-for="i in 5"
        :key="i"
        :class="[
          i <= score ? barColorClass : 'bg-outline-variant/20',
          'h-full rounded-full transition-all duration-300'
        ]"
      />
    </div>

    <!-- Requirements list -->
    <ul class="space-y-1.5 text-xs text-on-surface-variant font-body">
      <li 
        v-for="(req, idx) in requirements" 
        :key="idx"
        class="flex items-center gap-2 transition-colors duration-300"
        :class="{ 'text-on-surface': req.met }"
      >
        <!-- Icon -->
        <span class="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
          <svg 
            v-if="req.met" 
            class="w-3.5 h-3.5 text-primary-container" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            stroke-width="3"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <svg 
            v-else 
            class="w-3 h-3 text-outline/50" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            stroke-width="2.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
        <span :class="{ 'line-through text-outline/50': req.met }">{{ req.label }}</span>
      </li>
    </ul>
  </div>
</template>
