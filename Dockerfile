FROM node:24-alpine AS builder

# Copy local code to the container image.
WORKDIR /app
COPY . ./

# Specify the arguments docker will need
ARG SERVER_BASE_URL
ARG ACCESS_CONTROL_ALLOW_ORIGIN

# React environmental variables are needed during the `npm build` phase,
# because this is a static application (no server side logic).
# https://stackoverflow.com/q/77736331/1305745
ENV VITE_APP_SERVER_BASE_URL=$SERVER_BASE_URL
ENV VITE_APP_ACCESS_CONTROL_ALLOW_ORIGIN=$ACCESS_CONTROL_ALLOW_ORIGIN

# Build the app
RUN npm install
RUN npm run build

# Set up the server environment and start the app
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/configfile.template
ENV PORT=8080
ENV HOST=0.0.0.0
RUN sh -c "envsubst '\$PORT'  < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf"
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
