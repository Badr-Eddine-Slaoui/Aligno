<script setup lang="ts">
const auth = useAuth()
const isSidebarOpen = ref(true)
const isMobileOpen = ref(false)

const toggleSidebar = () => {
  if (window.innerWidth < 1024) {
    isMobileOpen.value = !isMobileOpen.value
  } else {
    isSidebarOpen.value = !isSidebarOpen.value
  }
}

const closeMobile = () => {
  isMobileOpen.value = false
}

const navLinks = [
  { to: '/dashboard', icon: 'heroicons:squares-2x2', label: 'Dashboard' },
  { to: '/projects', icon: 'heroicons:folder', label: 'Projects' },
  { to: '/time-management', icon: 'heroicons:clock', label: 'Time' },
  { to: '/wallet', icon: 'heroicons:wallet', label: 'Wallet' },
  { to: '/profile', icon: 'heroicons:user', label: 'Profile' },
]
</script>

<template>
  <div class="min-h-screen bg-surface text-on-surface flex">
    <div
      v-if="isMobileOpen"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      aria-hidden="true"
      @click="closeMobile"
    />

    <aside
      class="glass border-r border-outline-variant transition-all duration-300 flex flex-col z-40 fixed lg:static h-full"
      :class="[
        isSidebarOpen ? 'lg:w-64' : 'lg:w-20',
        isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
      aria-label="Main navigation"
    >
      <div class="h-16 flex items-center px-6 border-b border-outline-variant gap-3 select-none">
        <Icon name="heroicons:sparkles" class="w-6 h-6 text-primary-container flex-shrink-0" />
        <span
          v-if="isSidebarOpen || isMobileOpen"
          class="font-display font-bold tracking-widest text-primary text-lg transition-opacity"
        >ALIGNO</span>
      </div>

      <nav class="flex-1 p-4 flex flex-col gap-2" role="navigation">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-high transition-colors"
          active-class="bg-primary-container/10 text-primary-container font-medium border border-primary-container/20"
          @click="closeMobile"
        >
          <Icon :name="link.icon" class="w-5 h-5 flex-shrink-0" :aria-label="link.label" />
          <span v-if="isSidebarOpen || isMobileOpen" class="text-sm">{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-outline-variant flex items-center justify-between">
        <NuxtLink to="/profile" class="flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity" @click="closeMobile">
          <AppAvatar :src="auth.user.value?.profilePictureUrl" :first-name="auth.user.value?.firstName" :last-name="auth.user.value?.lastName" size="sm" />
          <div v-if="isSidebarOpen || isMobileOpen" class="flex flex-col overflow-hidden">
            <span class="text-sm font-semibold truncate text-on-surface">{{ auth.user.value?.firstName }} {{ auth.user.value?.lastName }}</span>
            <span class="text-xs text-on-surface-variant truncate">{{ auth.user.value?.email }}</span>
          </div>
        </NuxtLink>
        <button
          v-if="isSidebarOpen || isMobileOpen"
          aria-label="Sign Out"
          @click="auth.logout()"
          class="text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg"
        >
          <Icon name="heroicons:arrow-left-on-rectangle" class="w-5 h-5" />
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-x-hidden min-h-screen lg:ml-0">
      <header class="h-16 glass border-b border-outline-variant flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0">
        <button
          aria-label="Toggle sidebar"
          @click="toggleSidebar"
          class="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <Icon name="heroicons:bars-3" class="w-6 h-6" />
        </button>

        <div class="flex items-center gap-4">
          <AppNotificationBell />
        </div>
      </header>

      <main class="flex-1 p-6 lg:p-8" role="main">
        <slot />
      </main>
    </div>
  </div>
</template>
