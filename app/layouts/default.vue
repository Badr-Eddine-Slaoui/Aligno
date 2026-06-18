<script setup lang="ts">
const auth = useAuth()
const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="min-h-screen bg-surface text-on-surface flex">
    <!-- Sidebar -->
    <aside
      class="glass border-r border-outline-variant transition-all duration-300 flex flex-col z-20"
      :class="[isSidebarOpen ? 'w-64' : 'w-20']"
    >
      <!-- Logo area -->
      <div class="h-16 flex items-center px-6 border-b border-outline-variant gap-3 select-none">
        <Icon name="heroicons:sparkles" class="w-6 h-6 text-primary-container flex-shrink-0" />
        <span v-if="isSidebarOpen" class="font-display font-bold tracking-widest text-primary text-lg transition-opacity">ALIGNO</span>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 p-4 flex flex-col gap-2">
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-high transition-colors"
          active-class="bg-primary-container/10 text-primary-container font-medium border border-primary-container/20"
        >
          <Icon name="heroicons:squares-2x2" class="w-5 h-5 flex-shrink-0" />
          <span v-if="isSidebarOpen" class="text-sm">Dashboard</span>
        </NuxtLink>

        <NuxtLink
          to="/projects"
          class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-high transition-colors"
          active-class="bg-primary-container/10 text-primary-container font-medium border border-primary-container/20"
        >
          <Icon name="heroicons:folder" class="w-5 h-5 flex-shrink-0" />
          <span v-if="isSidebarOpen" class="text-sm">Projects</span>
        </NuxtLink>

        <NuxtLink
          to="/wallet"
          class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-high transition-colors"
          active-class="bg-primary-container/10 text-primary-container font-medium border border-primary-container/20"
        >
          <Icon name="heroicons:wallet" class="w-5 h-5 flex-shrink-0" />
          <span v-if="isSidebarOpen" class="text-sm">Wallet</span>
        </NuxtLink>

        <NuxtLink
          to="/profile"
          class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-high transition-colors"
          active-class="bg-primary-container/10 text-primary-container font-medium border border-primary-container/20"
        >
          <Icon name="heroicons:user" class="w-5 h-5 flex-shrink-0" />
          <span v-if="isSidebarOpen" class="text-sm">Profile</span>
        </NuxtLink>
      </nav>

      <!-- User footer profile -->
      <div class="p-4 border-t border-outline-variant flex items-center justify-between">
        <NuxtLink to="/profile" class="flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity">
          <AppAvatar :src="auth.user.value?.profilePictureUrl" :first-name="auth.user.value?.firstName" :last-name="auth.user.value?.lastName" size="sm" />
          <div v-if="isSidebarOpen" class="flex flex-col overflow-hidden">
            <span class="text-sm font-semibold truncate text-on-surface">{{ auth.user.value?.firstName }} {{ auth.user.value?.lastName }}</span>
            <span class="text-xs text-on-surface-variant truncate">{{ auth.user.value?.email }}</span>
          </div>
        </NuxtLink>
        <button
          v-if="isSidebarOpen"
          @click="auth.logout()"
          class="text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg"
          title="Sign Out"
        >
          <Icon name="heroicons:arrow-left-on-rectangle" class="w-5 h-5" />
        </button>
      </div>
    </aside>

    <!-- Main Content Frame -->
    <div class="flex-1 flex flex-col overflow-x-hidden min-h-screen">
      <!-- Topbar Header -->
      <header class="h-16 glass border-b border-outline-variant flex items-center justify-between px-8 z-10">
        <button @click="toggleSidebar" class="text-on-surface-variant hover:text-on-surface transition-colors">
          <Icon name="heroicons:bars-3" class="w-6 h-6" />
        </button>

        <div class="flex items-center gap-4">
          <AppNotificationBell />
        </div>
      </header>

      <!-- Dynamic Page slot -->
      <main class="flex-1 p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
