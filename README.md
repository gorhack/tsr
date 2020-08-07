![Full CI/CD](https://github.com/gorhack/tsr/workflows/Full%20CI/CD/badge.svg)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=gorhack_tsr&metric=security_rating)](https://sonarcloud.io/dashboard?id=gorhack_tsr)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=gorhack_tsr&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=gorhack_tsr)


# _TSR_
#### Track, Synchronize, Reporting Tool
Dynamic tracking management tool. _TSR_ is built on Spring and React.

## Goal
Dynamically manage and track planning requirements in a collaborative space.
- [x] CI/CD pipeline
    - [x] testing
    - [x] deploy (currently deploys to [aws eb](https://tracked.events))
- [ ] SSO
    - [x] [keycloak](https://kc.tracked.events/auth/)
    - [ ] transition from dev/testing environment to deployment version of kc
    - [ ] third party SSO?
    - [x] user roles ("user" / "admin")
- [ ] integrate with 3rd party systems
- [ ] real time
- [ ] notifications

## Setup
For setup, run `setup.sh`

## Run
Ensure docker is running the required containers with `./docker_go.sh`. `./run.sh` will run the full application.
`./gradlew bootrun` will just run the backend. `yarn start` in the client directory will run just the front end.

## Testing
Created with TDD principles. Run `test.sh` to run all tests. 

On the front-end we use jest, react-testing-library, and testdouble for mocking.

On the backend we use JUnit5 and mockk for mocking. 

## AWS
### App
To initialize Elastic Beanstalk (EB) app through the CLI, run `eb init -p docker tsr`

To create EB environment with Postgresql and an Application Load Balancer, run
`eb create tracked-events --database.engine postgres --database.version 12.2 --elb-type application`

The application deploys to AWS during CI/CD pipeline on the `master` branch. Steps below on manually deploying your local changes:
1. build the application `./pipeline/build.sh`
1. move the .jar in `build/libs` to `pipeline/eb` as `tsr.jar`
1. `eb deploy tracked-events --label [name of deploy]`

### Keycloak
Testing keycloak environment deployed to EC2 at https://kc.tracked.events.

### Certificate
Route 53 for the domain alias mapping. Certificate Manager to create the TLS certificate.
