
build: --build-docker reset-env

reset-env:
	rm -rf .docker/nginx/ui ddb.local.yaml
	ddb configure

--build-docker:
	@(cd ui && npm run build && cp -R ./dist ../.docker/nginx/ui)
	echo "core:" > ddb.local.yaml
	echo "  env:" >> ddb.local.yaml
	echo "    current: prod" >> ddb.local.yaml
	ddb configure
	docker-compose build web
