FROM ubuntu:23.10

# setup node
# more info: https://github.com/nodesource/distributions
RUN apt-get update
RUN apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install nodejs -y

# setup files
COPY app /app
COPY --chmod=744 docker-entrypoint.sh /app
WORKDIR /app

# install node_modules
RUN npm install

# run script
entrypoint ["./docker-entrypoint.sh"]

