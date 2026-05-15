FROM node:lts-alpine

RUN apk add --no-cache bash curl git build-base pkgconfig zlib-dev \
    && curl https://sh.rustup.rs -sSf | sh -s -- -y

ENV PATH="/root/.cargo/bin:${PATH}"
WORKDIR /app
RUN npm install -g nuxi

USER node

CMD sh -c "\
  if [ ! -f package.json ]; then \
    echo '⚡ Creating Nuxt project...'; \
    nuxi init . --template minimal --force; \
    npm install; \
    npm i zod prisma @prisma/client jsonwebtoken bcrypt uuid; \
    npm i socket.io socket.io-client @vueuse/core cookie-parser; \
    npm i ioredis; \
    npm i --save-dev @nuxtjs/tailwindcss pinia @pinia/nuxt pinia-plugin-persistedstate @types/jsonwebtoken @types/bcrypt; \
  fi && \
  echo '⚡ Installing dependencies...'; \
  npm install && \
  echo '⚡ Starting Nuxt...'; \
  npm run dev -- --host \
"