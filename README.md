![Full CI/CD](https://github.com/gorhack/tsr/workflows/Full%20CI/CD/badge.svg)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=gorhack_tsr&metric=security_rating)](https://sonarcloud.io/dashboard?id=gorhack_tsr)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=gorhack_tsr&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=gorhack_tsr)

![](logo/logo492.png)

# _TSR_

#### Track, Synchronize, Reporting Tool

_TSR_ is an event management tool created with the goal of helping military units plan training
events. _TSR_ is built to be completely modular; capable of assisting any organization plan and
coordinate any kind of event. It is designed for organizations that require collaboration and
cross-communication with both internal and external organizations. _TSR_ enables transparency
amongst participating organizations that work together to plan and coordinate events.

## Setup

_TSR_ is built on Spring and React.

- Install Docker
- On Ubuntu or OSX with bash or zsh: run `. ./setup.sh`.
- Source your shell and `direnv` should source your project's `.envrc` when you enter the project
  directory

#### Dependencies Installed:

- Java 15 (JDK)
- `yarn`
- `direnv`
- Docker / `docker-compose`
- OSX specific: `homebrew` and `geckodriver`

## Run

- Ensure docker is running the required containers (`postgres:12.3-alpine` and
  `g0rak/tsr-keycloak`). `./docker_go.sh` will pull and run both containers.
- `./run.sh` will run the full application.
    - `gradlew bootrun` will just run the backend <http://localhost:8080>
    - `yarn start` in the client directory will run just the front end <http://localhost:3000>.
- Login with user `tsr:password` at <http://localhost:8080>. Switch to port 3000 for live reloading.
- _TSR_ uses Websockets for updating event state.
- `./pipeline/build.sh` will build and package _TSR_ as a runnable jar file in `build/libs`.

## Testing

Created with TDD principles. Run `test.sh` to run all tests.

- On the backend we use [JUnit5](https://junit.org/junit5/docs/current/user-guide/)
  and [mockk](https://mockk.io) for mocking.
    - To run the backend tests alone, run `gradlew test` in the root directory.
- On the front-end we
  use [react-testing-library](https://testing-library.com/docs/react-testing-library/intro), and
  [testdouble](https://github.com/testdouble/testdouble.js) / [jest](https://jestjs.io) for mocking.
    - To run the frontend tests alone, run `yarn test` in the client directory.

## Auth

Currently, _TSR_ uses [Keycloak's](https://www.keycloak.org) Oauth2 and Spring Security for
authentication. Locally, keycloak runs
within [docker](https://hub.docker.com/repository/docker/g0rak/tsr-keycloak)
on port 8081 with tsr realm credentials `tsr:tsr`. _TSR_ user credentials are `tsr:password` /and/
`tsrAdmin:password`, providing regular and admin user roles respectively.

## Contribute

_TSR_ is licensed under the GPLv3 license. To contribute: find an issue in the backlog, or add your
own issue as a story (user benefit), bug, or chore (developer benefit). Assign yourself to the issue
and create a branch with a descriptive name. Make a pull request and commit your work to your
branch. If work is incomplete on the pull request, please keep it in a draft until it is ready for
review. Request a review from any of the project maintainers. See the _TSR_'s
[roadmap](./ROADMAP.md) for a high level overview of my goals for this project.