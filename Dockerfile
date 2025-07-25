# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install canvas dependencies for Alpine Linux
RUN apk add --no-cache libc6-compat cairo-dev jpeg-dev pango-dev giflib-dev librsvg-dev build-base g++ make python3
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --production=false --legacy-peer-deps || npm install --production=false --legacy-peer-deps
RUN npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
# Install canvas dependencies for building
RUN apk add --no-cache libc6-compat cairo-dev jpeg-dev pango-dev giflib-dev librsvg-dev build-base g++ make python3
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
# Set a dummy MongoDB URI for build time (not used during static generation)
ENV MONGODB_URI="mongodb://localhost:27017/dummy"
ENV MONGODB_DB="dummy"

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
