# Select the base image
FROM nadavtasher/base
# Install docker-compose and git
RUN apt-get update
RUN apt-get -y install --no-install-recommends --no-install-suggests docker-compose git ssh
# Create dockervisor volume
RUN mkdir /dockervisor
# Configure git to use dockervisor key
RUN git config --system core.sshCommand "ssh -i /dockervisor/key/id -o StrictHostKeyChecking=No -o UserKnownHostsFile=/dev/null -F /dev/null"
# Copy sources
COPY backend backend
COPY frontend frontend
# Set command
CMD ["application.mjs"]