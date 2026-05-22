export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    'nuxt-security',
  ],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    resendApiKey: process.env.RESEND_API_KEY,
    appUrl: process.env.APP_URL,
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
} as any)


