# build environment
FROM node:21-alpine as react-build

WORKDIR /app
COPY . ./

ARG SERVER_BASE_URL
ARG ACCESS_CONTROL_ALLOW_ORIGIN

# React environmental variables are needed during the `npm build` phase,
# because this is a static application (no server side logic).
# https://stackoverflow.com/q/77736331/1305745
ENV REACT_APP_SERVER_BASE_URL $SERVER_BASE_URL
ENV REACT_APP_ACCESS_CONTROL_ALLOW_ORIGIN $ACCESS_CONTROL_ALLOW_ORIGIN

#Using NPM instead of yarn
RUN npm install
RUN npm run build

# server environment
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/configfile.template
ENV PORT 8080
ENV HOST 0.0.0.0
RUN sh -c "envsubst '\$PORT'  < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf"
COPY --from=react-build /app/build /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
