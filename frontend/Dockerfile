# ---- Stage 1: Build the React app ----
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install deps
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci || npm install

# Copy source code
COPY . .

# Build args become env vars for Vite at build time
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_KEY=$VITE_SUPABASE_KEY

# Build application
RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
