<script setup lang="ts">
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Page Not Found – Aligno',
  description: 'The page you are looking for does not exist.',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
    <div class="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center">
      <Icon name="heroicons:face-frown" class="w-12 h-12 text-on-surface-variant" />
    </div>
    <div>
      <h1 class="text-6xl font-bold font-display text-primary">404</h1>
      <p class="text-xl font-semibold text-on-surface mt-2">Page Not Found</p>
      <p class="text-on-surface-variant mt-1 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
    </div>
    <NuxtLink
      to="/dashboard"
      class="flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary-container rounded-xl font-semibold hover:opacity-90 transition-opacity"
    >
      <Icon name="heroicons:home" class="w-5 h-5" />
      Back to Dashboard
    </NuxtLink>
  </div>
</template>
