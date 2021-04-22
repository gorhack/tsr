![Full CI/CD](https://github.com/gorhack/tsr/workflows/Full%20CI/CD/badge.svg)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=gorhack_tsr&metric=security_rating)](https://sonarcloud.io/dashboard?id=gorhack_tsr)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=gorhack_tsr&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=gorhack_tsr)

![](logo/logo492.png)
# _TSR_
#### Track, Synchronize, Reporting Tool
Dynamic tracking management tool. _TSR_ is built on Spring and React.

## Project Goals
Dynamically manage and track planning requirements in a collaborative space.
- [x] CI/CD pipeline
    - [x] test - back/front end
    - [x] code quality - [sonarcloud](https://sonarcloud.io/dashboard?id=gorhack_tsr)
    - [x] dependency scan - Github's Dependabot
    - [x] deploy - [aws eb](https://tracked.events)
    - [ ] deploy to Coding Repository and Transformation Environment (CReATE) platform (~JUN 2021)
- [ ] SSO
    - [x] [keycloak](http://alcesleo.github.io/2020/01/30/setting-up-keycloak-on-aws/)
    - [ ] transition from dev/testing environment to deployment ready version of kc
    - [ ] third party SSO?
    - [x] user roles ("user" / "admin")
- [ ] transition from [dev/testing rds](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.managing.db.html?icmpid=docs_elasticbeanstalk_console)
db to deployment db
- [ ] integrate with 3rd party systems
- [x] real time web socket updates
- [ ] notifications

## Setup
For setup, run `setup.sh`.

## Run
Ensure docker is running the required containers (`postgres:12.3-alpine` and `g0rak/tsr-keycloak`) with
`./docker_go.sh`. `./run.sh` will run the full application. `./gradlew bootrun` will just run the backend. `yarn start`
in the client directory will run just the front end.

## Testing
Created with TDD principles. Run `test.sh` to run all tests.

On the front-end we use [react-testing-library](https://testing-library.com/docs/react-testing-library/intro), and
[testdouble](https://github.com/testdouble/testdouble.js) / [jest](https://jestjs.io) for mocking.

On the backend we use [JUnit5](https://junit.org/junit5/docs/current/user-guide/) and [mockk](https://mockk.io) for
mocking.

## Auth
Currently, _TSR_ uses [Keycloak's](https://www.keycloak.org) Oauth2 and Spring Security for authentication. Locally,
keycloak runs within [docker](https://hub.docker.com/repository/docker/g0rak/tsr-keycloak) on port 8081 with realm
credentials tsr:tsr and user credentials tsr:password /and/ tsrAdmin:password

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