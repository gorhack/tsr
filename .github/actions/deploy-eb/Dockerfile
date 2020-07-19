FROM ubuntu:18.04

LABEL "name"="Deploy AWS elastic beanstalk"
LABEL "maintainer"="Kyle Gorak"
LABEL "version"="0.0.1"

LABEL "com.github.actions.name"="Deploy AWS EB"
LABEL "com.github.actions.description"="Deploy to AWS EB"
LABEL "com.github.actions.icon"="terminal"
LABEL "com.github.actions.color"="green"

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]