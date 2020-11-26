darkanakin41/ddb-anchor
===
This project have been generated with [darkanakin41/project-toolbox](https://github.com/darkanakin41/project-toolbox)

Check feeds list (vulnerability database update): 
```shell script
anchore-cli system feeds list
```

Registry Authentication: 
```shell script
anchore-cli registry add --registry-type <registry> <username> <password>
```

Image management
```shell script
anchore-cli repo add docker.io/nginx # Add repo to watch
anchore-cli image list # Check image list
anchore-cli image add <your-image> # Image addition
anchore-cli image content <your-image> # Image content
anchore-cli image vuln <your-image> all # Image vulnerabilities
anchore-cli evaluate check <your-image> # Evaluate image security
```


anchore-cli image del docker.io/nginx:1.14-alpine-perl 
anchore-cli image del docker.io/nginx:1.15.3-perl 
anchore-cli image del docker.io/nginx:1.17.10-alpine 
anchore-cli image del docker.io/nginx:1.17.2-alpine 
anchore-cli image del docker.io/nginx:1.17.4-alpine-perl 
anchore-cli image del docker.io/nginx:1.9.6 
anchore-cli image del docker.io/nginx:alpine-perl