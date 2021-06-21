## Project Roadmap

Dynamically manage and track planning requirements in a collaborative space. See the most up to
date [backlog](https://github.com/gorhack/tsr/projects/2)
and [icebox](https://github.com/gorhack/tsr/projects/3). Issues in the backlog are priorized. 
Issues in the icebox are in no particular order.

### Overarching project goals:

- [x] CI/CD pipeline
    - [x] Test - back/front end
    - [x] Code quality - [sonarcloud](https://sonarcloud.io/dashboard?id=gorhack_tsr)
    - [x] Dependency scan - Github's Dependabot
    - [x] Development deploy - <https://tracked.events>
    - [ ] Deploy to Coding Repository and Transformation Environment (CReATE) platform
      (TBD 2021/2022)
- [ ] SSO
    - [x] Development keycloak <https://kc.tracked.events>
    - [ ] Production ready
    - [ ] Third party login
    - [x] Application ser roles ("user" / "admin")
    - [ ] Organization specific user roles ("org_user" / "org_admin")
    - [ ] External organization sharing / password protected limited input request
- [ ] Integrate with 3rd party systems
- [x] Real time web socket updates
- [ ] Notifications
    - [ ] In-app
    - [ ] Email
    - [ ] Text