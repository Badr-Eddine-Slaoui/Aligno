<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  error: '',
  required: false,
  disabled: false,
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <label
      v-if="label"
      :for="id"
      class="font-display font-medium text-xs tracking-wider uppercase text-on-surface-variant"
    >
      {{ label }} <span v-if="required" class="text-error">*</span>
    </label>

    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        class="w-full bg-surface-container-low text-on-surface rounded-xl px-4 py-3 text-sm transition-all duration-300 border border-outline-variant focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          error ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant'
        ]"
      />
    </div>

    <p v-if="error" class="text-error text-xs font-mono mt-1 font-medium">
      {{ error }}
    </p>
  </div>
</template>
