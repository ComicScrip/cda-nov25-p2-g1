FROM nginx:stable-alpine3.23

# Install curl for healthchecks
RUN apk add --no-cache curl ca-certificates

COPY ./nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]