export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/image',
    '@pinia/nuxt',
    'nuxt-security',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    resendApiKey: process.env.RESEND_API_KEY,
    appUrl: process.env.APP_URL,
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:4000',
      apiBase: '/api',
    },
  },

  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        module: 'esnext',
      },
    },
  },

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },
} as any)


