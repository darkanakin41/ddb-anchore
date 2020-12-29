local ddb = import 'ddb.docker.libjsonnet';

local db_user = "anchore";
local db_password = "anchore";

local domain = std.join('.', [std.extVar("core.domain.sub"), std.extVar("core.domain.ext")]);
local port_prefix = std.extVar("docker.port_prefix");

local app_workdir = "/app";
local anchore_auth_secret = 'ddbanchoreisgreat';

local prefix_port(port, output_port = null)= [port_prefix + (if output_port == null then std.substr(port, std.length(port) - 2, 2) else output_port) + ":" + port];

ddb.Compose() {
	"services": {
		db: ddb.Image("postgres:9")
		    + {
                environment: {
                    "POSTGRES_PASSWORD": db_password,
                },
                volumes: [
                    "anchore-db-volume:/var/lib/postgresql/data:rw",
                ],
                healthcheck:{
                  test: ["CMD-SHELL", "pg_isready -U postgres"]
                },
            },
		analyzer: ddb.Image("anchore/anchore-engine:v0.8.2")
		    + {
		        command: ["anchore-manager", "service", "start", "analyzer"],
		        depends_on: ['db','catalog'],
		        environment: {
		            ANCHORE_ENDPOINT_HOSTNAME: 'analyzer',
		            ANCHORE_OAUTH_ENABLED: 'true',
		            ANCHORE_AUTH_SECRET: anchore_auth_secret,
		            ANCHORE_DB_HOST: 'db',
		            ANCHORE_DB_PASSWORD: db_password,
		        },
            },
		'policy-engine': ddb.Image("anchore/anchore-engine:v0.8.2")
		    + {
		        command: ["anchore-manager", "service", "start", "policy_engine"],
		        depends_on: ['db','catalog'],
		        environment: {
		            ANCHORE_ENDPOINT_HOSTNAME: 'policy-engine',
		            ANCHORE_OAUTH_ENABLED: 'true',
		            ANCHORE_AUTH_SECRET: anchore_auth_secret,
		            ANCHORE_DB_HOST: 'db',
		            ANCHORE_DB_PASSWORD: db_password,
		        },
            },
		queue: ddb.Image("anchore/anchore-engine:v0.8.2")
		    + {
		        command: ["anchore-manager", "service", "start", "simplequeue"],
		        depends_on: ['db','catalog'],
		        environment: {
		            ANCHORE_ENDPOINT_HOSTNAME: 'queue',
		            ANCHORE_OAUTH_ENABLED: 'true',
		            ANCHORE_AUTH_SECRET: anchore_auth_secret,
		            ANCHORE_DB_HOST: 'db',
		            ANCHORE_DB_PASSWORD: db_password,
		        }
            },
		catalog: ddb.Image("anchore/anchore-engine:v0.8.2")
		    + {
		        command: ["anchore-manager", "service", "start", "catalog"],
		        depends_on: ['db'],
		        environment: {
		            ANCHORE_ENDPOINT_HOSTNAME: 'catalog',
		            ANCHORE_OAUTH_ENABLED: 'true',
		            ANCHORE_AUTH_SECRET: anchore_auth_secret,
		            ANCHORE_DB_HOST: 'db',
		            ANCHORE_DB_PASSWORD: db_password,
		        },
            },
		api: ddb.Image("anchore/anchore-engine:v0.8.2")
		    + ddb.VirtualHost("8228", std.join(".", ["api", domain]), "api")
		    + ddb.Binary('anchore-cli', args='anchore-cli')
		    + {
		        command: ["anchore-manager", "service", "start", "apiext"],
		        depends_on: ['db'],
		        environment: {
		            ANCHORE_ENDPOINT_HOSTNAME: 'queue',
		            ANCHORE_DB_HOST: 'db',
		            ANCHORE_DB_PASSWORD: db_password,
		            ANCHORE_AUTH_SECRET: anchore_auth_secret,
		            ANCHORE_OAUTH_ENABLED: 'true',
		            ANCHORE_CLI_USER: 'admin',
		            ANCHORE_CLI_PASS: 'foobar',
		            ANCHORE_CLI_URL: "http://" + std.join(".", ["api", domain]) + "/v1/",
		        },
		        ports: ['8228:8228']
            },
		'swagger-ui-nginx': ddb.Image("nginx:latest")
		    + ddb.VirtualHost("8080", std.join(".", ["swagger", domain]), "swagger")
		    + {
		        depends_on: ['api', 'swagger-ui'],
		        volumes: [
		            ddb.path.project + '/swagger-ui.nginx.conf:/etc/nginx/nginx.conf'
		        ]
            },
		'swagger-ui': ddb.Image("swaggerapi/swagger-ui")
		    + {
		        environment: {
		            URL:'https://' + std.join(".", ["swagger", domain]) + '/v1/swagger.json'
		        }
            },

        node: ddb.Build("node")
            + ddb.User()
            + ddb.Binary("ncu", app_workdir, "ncu",  "--label traefik.enable=false")
            + ddb.Binary("npm", app_workdir, "npm")
            + ddb.Binary("vue", app_workdir, "vue",  "--label traefik.enable=false")
            + ddb.Binary("conventional-changelog", app_workdir, "conventional-changelog", "--label traefik.enable=false")
            + (if ddb.env.is("dev") then ddb.VirtualHost("8080", std.join(".", ["ui", domain]), "ui") else {})
            + {
                command: ["npm", "run", "serve"],
                working_dir: app_workdir + "/ui",
                volumes: [
                    ddb.path.project + ":" + app_workdir + ":rw",
                    "node-cache:/home/node/.cache:rw",
                    "node-npm-packages:/home/node/.npm-packages:rw"
                ],
            },
	}
}
