<script setup lang="ts">
useSeoMeta({
  title: 'Aligno – Work, Time & Finance Planner',
  description: 'Aligno is an all-in-one productivity app for managing projects, daily schedules, and finances.',
})

onMounted(() => {
  navigateTo('/dashboard')
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
</template>
