<script setup lang="ts">
import type { BankAccount } from '~/types'

const props = defineProps<{
  account: BankAccount
  isActive: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  edit: [account: BankAccount]
  delete: [id: string]
}>()
</script>

<template>
  <div
    @click="emit('select', account.id)"
    class="glass rounded-xl p-6 relative flex flex-col justify-between h-48 cursor-pointer transition-all duration-300 border overflow-hidden select-none"
    :class="[
      isActive
        ? 'border-primary-container/80 shadow-[0_0_20px_rgba(0,229,255,0.15)] ring-2 ring-primary-container/10'
        : 'border-white/5 hover:border-white/20 hover:scale-[1.01]'
    ]"
  >
    <div class="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

    <div class="flex justify-between items-start z-10">
      <div class="flex flex-col">
        <span class="font-display font-bold text-base text-on-surface truncate max-w-[180px]">{{ account.name }}</span>
        <span class="text-xs text-on-surface-variant font-body mt-0.5">{{ account.bankName || 'Unknown Bank' }}</span>
      </div>
      <div class="flex gap-2">
        <button @click.stop="emit('edit', account)" class="text-on-surface-variant hover:text-primary transition-colors p-1" title="Edit Account">
          <Icon name="heroicons:pencil-square" class="w-4 h-4" />
        </button>
        <button @click.stop="emit('delete', account.id)" class="text-on-surface-variant hover:text-error transition-colors p-1" title="Delete Account">
          <Icon name="heroicons:trash" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="z-10 flex flex-col mt-4">
      <span class="text-xs uppercase font-mono tracking-widest text-on-surface-variant/60">Balance</span>
      <span class="font-display font-black text-2xl text-primary-container tracking-tight">
        {{ account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
        <span class="text-lg text-primary/80 font-bold ml-0.5">{{ account.currency }}</span>
      </span>
    </div>

    <div class="z-10 flex justify-between items-center mt-2 border-t border-white/5 pt-2">
      <span class="text-xs font-mono text-on-surface-variant/70">{{ account.accountNumber || '•••• •••• ••••' }}</span>
      <span class="text-[10px] font-mono uppercase bg-primary-container/10 text-primary-container px-2 py-0.5 rounded-full border border-primary-container/20">
        Active
      </span>
    </div>
  </div>
</template>
