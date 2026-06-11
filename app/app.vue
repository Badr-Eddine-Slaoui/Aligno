<script setup lang="ts">
import { Notivue, NotivueSwipe } from 'notivue'
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global Toast Container -->
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
  </div>
</template>
