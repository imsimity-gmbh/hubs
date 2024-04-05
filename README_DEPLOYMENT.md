# Instructions to setup deployment of hubs ce custom client to a remote docker registry

* Make sure the files `Dockerfile`, `scripts/docker/nginx.config` and `scripts/docker/run.sh` exist with contents according to:
  * https://github.com/mozilla/hubs/tree/master/scripts/docker
  * https://github.com/mozilla/hubs/blob/master/RetPageOriginDockerfile
* Make sure a Github Action exists under `.github/workflows` that builds a docker image and pushes the image to a remote repository
* Configure the required config params (Github Action Secrets and Variabled) specified in the workflow .yml. The following variables need to be set:
  * Configure as Secrets:
    * AWS_ECR_ACCESS_KEY_ID
    * AWS_ECR_ACCESS_KEY_SECRET
  * Configure as Variables:
    * AWS_ECR_REGION
    * AWS_ECR_REGISTRY
    * AWS_ECR_REPOSITORY
