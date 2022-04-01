FROM node:16.14.2-alpine3.14

LABEL "name"="Frontend Yarn Test"
LABEL "maintainer"="Kyle Gorak"
LABEL "version"="0.0.1"

LABEL "com.github.actions.name"="Frontend Yarn Test"
LABEL "com.github.actions.description"="Frontend Yarn Test"
LABEL "com.github.actions.icon"="terminal"
LABEL "com.github.actions.color"="green"

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]