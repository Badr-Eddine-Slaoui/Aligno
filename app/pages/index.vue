<script setup lang="ts">
const appUrl = useRuntimeConfig().public.appUrl

useSeoMeta({
  title: 'Aligno – All-in-One Productivity Platform',
  description: 'Aligno is a powerful productivity platform for managing projects, daily schedules, and personal finances — all in one place.',
  keywords: 'project management, time management, personal finance, productivity app, kanban board, budget tracker, schedule planner',
  ogTitle: 'Aligno – All-in-One Productivity Platform',
  ogDescription: 'Manage your projects, daily schedule, and finances with Aligno. The smart productivity platform built for modern professionals.',
  ogType: 'website',
  ogUrl: appUrl,
  ogImage: `${appUrl}/og-image.png`,
  ogImageWidth: '1200',
  ogImageHeight: '630',
  ogImageAlt: 'Aligno – All-in-One Productivity Platform',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Aligno – All-in-One Productivity Platform',
  twitterDescription: 'Manage your projects, daily schedule, and finances with Aligno.',
  twitterImage: `${appUrl}/og-image.png`,
  robots: 'index, follow',
})

useHead({
  link: [{ rel: 'canonical', href: appUrl }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Aligno',
      url: appUrl,
      description: 'All-in-one productivity platform for projects, time, and finance management.',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  }],
})

definePageMeta({
  middleware: [
    () => navigateTo('/dashboard', { replace: true })
  ]
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
</template>
