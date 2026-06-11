<template>
  <div class="relative min-h-screen bg-surface flex items-center justify-center p-6 overflow-hidden">
    <!-- Decorative background glow orbs -->
    <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-container/10 filter blur-3xl" />
    <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-secondary-container/10 filter blur-3xl" />

    <div class="w-full max-w-md z-10 flex flex-col items-center gap-6">
      <div class="flex items-center gap-2 select-none">
        <Icon name="heroicons:sparkles" class="w-8 h-8 text-primary-container animate-pulse" />
        <span class="font-display font-bold text-2xl tracking-widest text-primary">ALIGNO</span>
      </div>

      <slot />
    </div>
  </div>
</template>
