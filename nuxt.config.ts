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

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s',
      meta: [
        { name: 'author', content: 'Aligno' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#6366f1' },
        { name: 'application-name', content: 'Aligno' },
        // Default OG fallbacks (pages override with useSeoMeta)
        { property: 'og:site_name', content: 'Aligno' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@alignoapp' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
} as any)


