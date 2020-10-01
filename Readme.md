# Dockervisor

Dockervisor is a minimalistic docker-compose project manager, deployable in one container.
## Installation

### Using `docker-compose`

Download the [docker-compose.yaml](https://raw.githubusercontent.com/NadavTasher/Dockervisor/master/docker-compose.yaml) file from the repository and run:

Modify the environment variables to change the repository and password.

```bash
docker-compose up --detach
```

### Using `docker`

Run the following command:
```bash
docker run \
     --privileged \
     --publish 7000:80 \
     --volume /var/run/docker.sock:/var/run/docker.sock \
     --volume dockervisor:/dockervisor \
     --environment PASSWORD=YourPassword \
     --environment REPOSITORY=YourUsername/YourRepository \
     nadavtasher/dockervisor
```
## Usage

Browse to your IP address at port `7000`

## License
[MIT](https://choosealicense.com/licenses/mit/)