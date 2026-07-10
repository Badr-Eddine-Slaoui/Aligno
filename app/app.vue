<script setup lang="ts">
import { Notivue, NotivueSwipe } from 'notivue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

useHead({
  htmlAttrs: {
    lang: 'en'
  }
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />

    <!-- Fullscreen Loading Screen during session restore -->
    <div v-if="authStore.isSessionRestoring" class="fixed inset-0 bg-surface z-50 flex flex-col items-center justify-center gap-4">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="font-display font-semibold text-lg text-primary tracking-widest animate-pulse">ALIGNO</p>
    </div>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global Toast Container -->
    <ClientOnly>
      <Notivue v-slot="elements">
        <div v-for="item in (elements as any).entries" :key="item.id">
          <NotivueSwipe :item="item">
            <div class="glass rounded-xl shadow-2xl border border-primary-container/20 text-on-surface p-4 flex flex-col gap-1 max-w-sm">
              <h4 v-if="item.title" class="font-display font-bold text-sm text-primary">
                {{ item.title }}
              </h4>
              <p class="text-xs text-on-surface-variant">
                {{ item.message }}
              </p>
            </div>
          </NotivueSwipe>
        </div>
      </Notivue>
    </ClientOnly>
  </div>
</template>
