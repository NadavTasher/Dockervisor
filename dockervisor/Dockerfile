# Select the base image
FROM webhood/template:2021.09.15

# Install docker-compose and git
RUN apt update
RUN apt --yes --no-install-recommends --no-install-suggests install docker-compose git ssh

# Copy SSH configuration
COPY patches/ssh /etc/ssh/ssh_config

# Create dockervisor volume
RUN mkdir /dockervisor

# Copy sources
COPY backend backend
COPY frontend frontend