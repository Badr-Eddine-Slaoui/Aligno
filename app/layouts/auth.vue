<template>
  <div class="relative min-h-screen bg-surface flex items-center justify-center p-6 overflow-hidden font-body">
    <!-- Animated modern cyber grid background -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.08),rgba(255,255,255,0))]" />
    <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

    <!-- Decorative background glow orbs -->
    <div class="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary-container/8 filter blur-3xl animate-[pulse_8s_infinite]" />
    <div class="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-secondary-container/8 filter blur-3xl animate-[pulse_12s_infinite]" />
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-surface-bright/3 filter blur-3xl" />

    <div class="w-full max-w-md z-10 flex flex-col items-center gap-8">
      <!-- Premium Logo Branding Section -->
      <div class="flex flex-col items-center gap-3 select-none">
        <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-container/20 to-surface-container border border-primary-container/30 shadow-[0_0_20px_rgba(0,229,255,0.15)] hover:scale-105 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 text-primary-container animate-pulse">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM18 10.5l-.562-3.438L14 6.5l3.438-.562L18 2.5l.562 3.438L22 6.5l-3.438.562L18 10.5zM19.078 19l-.313-1.687L17 17l1.687-.313L19 15l.313 1.687L21 17l-1.687.313L19.078 19z" />
          </svg>
        </div>
        <div class="text-center">
          <h1 class="font-display font-extrabold text-3xl tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-container drop-shadow-sm">ALIGNO</h1>
          <p class="text-[10px] text-on-surface-variant font-mono tracking-widest uppercase mt-0.5 opacity-80">Precision task management</p>
        </div>
      </div>

      <slot />
    </div>
  </div>
</template>
