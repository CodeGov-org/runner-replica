FROM ubuntu:23.10

# setup podman
RUN apt-get update
RUN apt-get install -y curl podman sudo

# download check script
RUN curl --proto '=https' --tlsv1.2 -sSLO https://raw.githubusercontent.com/dfinity/ic/master/gitlab-ci/tools/repro-check.sh
RUN chmod +x repro-check.sh

# setup entrypoint
COPY --chmod=744 docker-entrypoint.sh .

# run script
ENTRYPOINT ["./docker-entrypoint.sh"]