# Select the base image
FROM nadavtasher/base

# Install docker-compose and git
RUN apt-get update
RUN apt-get -y install --no-install-recommends --no-install-suggests docker-compose git ssh

# Copy SSH configuration
COPY patches/ssh /etc/ssh/ssh_config

# Create dockervisor volume
RUN mkdir /dockervisor

# Copy sources
COPY backend backend
COPY frontend frontend

# Set command
CMD ["application.mjs"]