<script setup lang="ts">
// Automatically forward from root to main dashboard page
onMounted(() => {
  navigateTo('/dashboard')
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
</template>
