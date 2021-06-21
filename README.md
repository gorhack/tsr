![Full CI/CD](https://github.com/gorhack/tsr/workflows/Full%20CI/CD/badge.svg)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=gorhack_tsr&metric=security_rating)](https://sonarcloud.io/dashboard?id=gorhack_tsr)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=gorhack_tsr&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=gorhack_tsr)

![](logo/logo492.png)
# _TSR_
#### Track, Synchronize, Reporting Tool
_TSR_ is built on Spring and React. TSR is an event management tool. It is designed for
organizations that require collaboration and cross-communication with both internal and external
organizations. TSR enables complete transparency amongst participating organizations that work
together to plan and coordinate events. Whether you are planning a single range or combined arms
exercise, TSR allows its users to successfully plan events.

## Setup
 - Install Docker
 - On Ubuntu or OSX with bash or zsh: run `. ./setup.sh`.
 - Source your shell and `direnv` should source your project's `.envrc` when you enter the project
   directory

### Dependencies Installed:
 - Java 15 (JDK)
 - `yarn`
 - `direnv`
 - Docker / `docker-compose`
 - OSX specific: `homebrew` and `geckodriver`

## Run
 - Ensure docker is running the required containers (`postgres:12.3-alpine` and
   `g0rak/tsr-keycloak`). `./docker_go.sh` will pull and run both containers.
 - `./run.sh` will run the full application.
   - `./gradlew bootrun` will just run the backend <http://localhost:8080>
   - `yarn start` in the client directory will run just the front end <http://localhost:3000>.
 - Login with user `tsr:password` at <http://localhost:8080>. Switch to port 3000 for live
   reloading.
 - TSR uses Websockets for updating event state.

## Testing
Created with TDD principles. Run `test.sh` to run all tests.

On the backend we use [JUnit5](https://junit.org/junit5/docs/current/user-guide/) and [mockk](https://mockk.io) for
mocking.

To run the backend tests alone, run `gradlew test` in the root directory.

On the front-end we use [react-testing-library](https://testing-library.com/docs/react-testing-library/intro), and
[testdouble](https://github.com/testdouble/testdouble.js) / [jest](https://jestjs.io) for mocking.

To run the frontend tests alone, run `yarn test` in the client directory.

## Auth
Currently, _TSR_ uses [Keycloak's](https://www.keycloak.org) Oauth2 and Spring Security for
authentication. Locally, keycloak runs within [docker](https://hub.docker.com/repository/docker/g0rak/tsr-keycloak)
on port 8081 with tsr realm credentials `tsr:tsr`. TSR user credentials are `tsr:password` /and/
`tsrAdmin:password`, providing regular and admin user roles respectively.

## AWS
#### **No longer deployed to AWS\**
### App
The Elastic Beanstalk (EB) setup is complete for _TSR_ in the `./pipeline/eb` directory with configuration and docker
files. If you need to deploy to elastic beanstalk locally, install the
[eb cli](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html).

The application deploys to AWS during CI/CD pipeline on the `master` branch. Manual steps to deploy your
local changes:
1. build the application `./pipeline/build.sh`
1. `eb deploy tracked-events --label [name of deploy]`

### Auth
A dev/testing keycloak environment deployed to EC2 at https://kc.tracked.events. Test user login test:password

### Certificate
Route 53 for the domain alias mapping. Certificate Manager to create the TLS certificate.

### AWS Initial Setup

#### Configure ./pipeline/eb/.ebextensions

Create Certificate in Certificate Manager. Copy Certificate Arn to `AWSEBV2LoadBalancerListenerHTTPS -> Certificates ->
CertificateArn`

#### Using EB CLI
To initialize app through the CLI, run `eb init -p docker tsr`

Additional environment configuration in `.ebextensions` which add the alb's HTTP redirect and configure the health path
to `/actuator/health`.

To create EB environment with Postgresql RDS, run
```
eb create tracked-events \
--database.engine postgres --database.version 12.3 \
--envvars TSR_KEYCLOAK_HOST=https://kc.tracked.events,TSR_KEYCLOAK_SECRET_KEY=random-password
```

Add the new RDS's security group to the elastic beanstalk application's security groups.