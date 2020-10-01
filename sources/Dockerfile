# Select the base image
FROM nadavtasher/base
# Install docker-compose and git
RUN apt-get update
RUN apt-get -y install docker-compose git
# Create volume
VOLUME /opt
# Copy sources
COPY backend backend
COPY frontend frontend
# Set command
CMD ["application.mjs"]