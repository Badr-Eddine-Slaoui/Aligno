<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  message?: string
  itemName?: string
  confirmLabel?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Confirm Deletion',
  message: 'This action is permanent and cannot be undone.',
  confirmLabel: 'Delete',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const cancel = () => emit('update:modelValue', false)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`confirm-title-${title?.replace(/\s+/g, '-').toLowerCase()}`"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-md"
          @click="cancel"
        />

        <!-- Panel -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-90 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-90 translate-y-4"
          appear
        >
          <div
            v-if="modelValue"
            class="relative w-full max-w-md z-10 glass rounded-2xl shadow-2xl overflow-hidden border border-error/10"
          >
            <!-- Top accent stripe -->
            <div class="h-1 w-full bg-gradient-to-r from-error/60 via-error to-error/60" />

            <div class="p-6 space-y-5">
              <!-- Header -->
              <div class="flex items-start gap-4">
                <!-- Icon -->
                <div class="flex-shrink-0 w-11 h-11 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center">
                  <Icon name="heroicons:exclamation-triangle-solid" class="w-5 h-5 text-error" />
                </div>

                <div class="flex-1 min-w-0">
                  <h3
                    :id="`confirm-title-${title?.replace(/\s+/g, '-').toLowerCase()}`"
                    class="font-display font-semibold text-base text-on-surface"
                  >
                    {{ title }}
                  </h3>
                  <p class="mt-1 text-sm text-on-surface-variant leading-relaxed">
                    {{ message }}
                  </p>
                </div>

                <!-- Close X -->
                <button
                  class="flex-shrink-0 p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  aria-label="Close dialog"
                  @click="cancel"
                >
                  <Icon name="heroicons:x-mark" class="w-4 h-4" />
                </button>
              </div>

              <!-- Item name highlight (optional) -->
              <div
                v-if="itemName"
                class="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/5 border border-error/15"
              >
                <Icon name="heroicons:tag" class="w-4 h-4 text-error/70 shrink-0" />
                <span class="text-sm font-semibold text-on-surface truncate">{{ itemName }}</span>
              </div>

              <!-- Divider -->
              <div class="border-t border-white/5" />

              <!-- Actions -->
              <div class="flex justify-end gap-3">
                <AppButton variant="ghost" :disabled="loading" @click="cancel">
                  Cancel
                </AppButton>
                <AppButton
                  variant="solid"
                  color="error"
                  :loading="loading"
                  @click="emit('confirm')"
                >
                  <Icon name="heroicons:trash" class="w-4 h-4 mr-1.5" />
                  {{ confirmLabel }}
                </AppButton>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
