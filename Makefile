
APP_NAME:=trastero
APP_WORKDIR:=/opt/app
API_PORT:=8080


image-api:
	docker build -t $(APP_NAME)-api --build-arg WORKDIR=$(APP_WORKDIR) -f ./docker/api.docker .


image-server:
	docker build -t $(APP_NAME)-server --build-arg WORKDIR=$(APP_WORKDIR) -f ./docker/server.docker .


image-ui:
	docker build -t $(APP_NAME)-ui --build-arg WORKDIR=$(APP_WORKDIR) -f ./docker/ui.docker .


images: image-server image-ui
	printf "complete"


env-export:
	printf "APP_NAME=$(APP_NAME)\nAPP_WORKDIR=$(APP_WORKDIR)\nAPI_PORT=$(API_PORT)" > .env


start: env-export
	docker-compose -f ./docker/stack.yaml up


start-db: env-export
	docker-compose -f ./docker/db.yaml up


apipython:
	docker exec -it `docker ps --filter "name=api" -q` ipython
