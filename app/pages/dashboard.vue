<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const auth = useAuth()
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold font-display text-primary">Welcome to Aligno</h1>
      <p class="text-on-surface-variant">Manage your work, daily life, and assets cohesively.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NuxtLink to="/projects" class="block">
        <AppCard hover-effect>
          <template #header>
            <div class="flex items-center gap-3">
              <Icon name="heroicons:squares-2x2" class="w-6 h-6 text-primary-container" />
              <h3 class="font-display font-semibold text-lg">Task Management</h3>
            </div>
          </template>
          <p class="text-sm text-on-surface-variant">Check board operations, customize workflow columns, and collaborate.</p>
        </AppCard>
      </NuxtLink>

      <AppCard hover-effect>
        <template #header>
          <div class="flex items-center gap-3">
            <Icon name="heroicons:clock" class="w-6 h-6 text-primary-container" />
            <h3 class="font-display font-semibold text-lg">Time Planner</h3>
          </div>
        </template>
        <p class="text-sm text-on-surface-variant">Coordinate assignments alongside custom scheduling templates.</p>
      </AppCard>

      <NuxtLink to="/wallet" class="block">
        <AppCard hover-effect>
          <template #header>
            <div class="flex items-center gap-3">
              <Icon name="heroicons:wallet" class="w-6 h-6 text-primary-container" />
              <h3 class="font-display font-semibold text-lg">Financial Tracking</h3>
            </div>
          </template>
          <p class="text-sm text-on-surface-variant">Oversee account balances, income channels, and track expenditures.</p>
        </AppCard>
      </NuxtLink>
    </div>
  </div>
</template>
