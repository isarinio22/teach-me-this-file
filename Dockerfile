# Stage 1: build the React app into client/dist.
FROM node:26-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci
COPY client client
RUN npm run build

# Stage 2: the image that runs. It holds the server, its dependencies and the built client,
# and none of the build tools.
FROM node:26-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --omit=dev --workspace server
COPY server server
COPY --from=build /app/client/dist client/dist
USER node
CMD ["node", "server/index.js"]
