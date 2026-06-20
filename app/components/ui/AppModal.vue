<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
}

defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-md" @click="close" />

        <!-- Content -->
        <div class="relative glass rounded-xl max-w-lg w-full p-8 shadow-2xl z-10 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-outline-variant pb-4 mb-6 shrink-0">
            <h3 v-if="title" class="font-display font-semibold text-lg text-on-surface">
              {{ title }}
            </h3>
            <button @click="close" class="text-on-surface-variant hover:text-on-surface transition-colors">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>

          <div class="overflow-y-auto">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
