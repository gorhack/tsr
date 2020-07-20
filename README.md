![Full CI/CD](https://github.com/gorhack/tsr/workflows/Full%20CI/CD/badge.svg)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=gorhack_tsr&metric=coverage)](https://sonarcloud.io/dashboard?id=gorhack_tsr)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=gorhack_tsr&metric=security_rating)](https://sonarcloud.io/dashboard?id=gorhack_tsr)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=gorhack_tsr&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=gorhack_tsr)


# _TSR_
#### Track, Synchronize, Reporting Tool
Dynamic tracking management tool. _TSR_ is built on Spring and React.

## Goal
Dynamically manage and track planning requirements in a collaborative space.
- [ ] CI/CD pipeline
    - [x] testing
    - [x] deploy (currently deploys to [aws eb](http://event-track.eba-dnnmqrpi.us-west-2.elasticbeanstalk.com))
- [ ] SSO
    - [ ] keycloak ?
    - [ ] user roles
- [ ] integrate with 3rd party systems
- [ ] real time
- [ ] notifications

## Setup
For setup, run `setup.sh`

## Run
Ensure docker is running the required containers with `./docker-go.sh`. `./run.sh` will run the full application.
`./gradlew bootrun` will just run the backend. `yarn start` in the client directory will run just the front end.

## Testing
Created with TDD principles. Run `test.sh` to run all tests.