<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AppNotification } from '~/types'

const projectsHelper = useProjects()
const notificationsHelper = useNotifications()

const showDropdown = ref(false)
const notifications = ref<AppNotification[]>([])

const unreadCount = computed(() => projectsHelper.unreadNotificationCount.value)

const fetchBellNotifications = async () => {
  try {
    const data = await projectsHelper.fetchNotifications({ page: 1, limit: 10 })
    if (data) {
      notifications.value = data.notifications
    }
  } catch (err) {
    console.error('Failed to fetch notifications:', err)
  }
}

onMounted(() => {
  fetchBellNotifications()
  
  // Set up polling interval to check for new notifications every 30 seconds
  const interval = setInterval(fetchBellNotifications, 30000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})

const toggleDropdown = (e: Event) => {
  e.stopPropagation()
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    fetchBellNotifications()
  }
}

// Close dropdown when clicking outside
if (import.meta.client) {
  window.addEventListener('click', () => {
    showDropdown.value = false
  })
}

const handleMarkAsRead = async (notification: AppNotification) => {
  if (notification.isRead) return
  try {
    await projectsHelper.markNotificationRead(notification.id)
    notification.isRead = true
    await fetchBellNotifications()
  } catch (err) {
    console.error('Failed to mark notification as read:', err)
  }
}

const handleMarkAllAsRead = async () => {
  try {
    await projectsHelper.markAllNotificationsRead()
    notifications.value.forEach(n => n.isRead = true)
    notificationsHelper.success('All notifications marked as read')
  } catch (err) {
    console.error('Failed to mark all as read:', err)
  }
}
</script>

<template>
  <div class="relative">
    <button 
      @click="toggleDropdown"
      class="relative p-2 rounded-xl glass hover:glass-hover transition-colors text-on-surface-variant hover:text-on-surface"
    >
      <Icon name="heroicons:bell" class="w-6 h-6" />
      <span 
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 rounded-full bg-primary-container text-on-primary-container text-[10px] font-mono font-bold px-1 glow-primary"
      >
        {{ unreadCount }}
      </span>
    </button>

    <!-- Dropdown menu -->
    <div 
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-surface-container-high/95 backdrop-blur-xl p-3 shadow-2xl z-30 space-y-3"
      @click.stop
    >
      <div class="flex justify-between items-center pb-2 border-b border-white/5">
        <h4 class="font-display font-semibold text-xs text-on-surface uppercase tracking-wider">
          Notifications
        </h4>
        <button 
          v-if="unreadCount > 0"
          @click="handleMarkAllAsRead"
          class="text-[10px] font-semibold text-primary-container hover:text-primary-container/80 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
        <div 
          v-if="notifications.length === 0"
          class="text-center py-6 text-xs text-on-surface-variant font-mono"
        >
          No notifications yet.
        </div>

        <div 
          v-else
          v-for="notification in notifications" 
          :key="notification.id"
          @click="handleMarkAsRead(notification)"
          class="p-2.5 rounded-xl border transition-all cursor-pointer text-left space-y-1"
          :class="[
            notification.isRead 
              ? 'bg-transparent border-transparent hover:bg-white/2' 
              : 'bg-primary-container/5 border-primary-container/20 hover:bg-primary-container/10'
          ]"
        >
          <div class="flex justify-between items-start gap-2">
            <span class="text-xs font-semibold text-on-surface line-clamp-1">
              {{ notification.title }}
            </span>
            <span v-if="!notification.isRead" class="w-1.5 h-1.5 rounded-full bg-primary-container mt-1.5 shrink-0" />
          </div>
          <p class="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
            {{ notification.message }}
          </p>
          <span class="text-[9px] font-mono text-on-surface-variant/50 block">
            {{ new Date(notification.createdAt).toLocaleDateString() }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
