#!/bin/bash

RDS_HOSTNAME="db"
RDS_PORT="5432"
RDS_DB_NAME="tsr"
RDS_JDBC_DATABASE_URL="jdbc:postgresql://$RDS_HOSTNAME:$RDS_PORT/$RDS_DB_NAME"

RDS_USERNAME="XXXXX"
RDS_PASSWORD="XXXXX"
TSR_KEYCLOAK_SECRET_KEY="XXXXX"
TSR_KEYCLOAK_HOST="https://kc.tracked.events/auth/realms/tsr"
TSR_KEYCLOAK_JWK="$TSR_KEYCLOAK_HOST/protocol/openid-connect/certs"

#curl -vvI https://kc.tracked.events #for debugging keycloak

/opt/openjdk-15/bin/java -Djava.net.preferIPv4Stack=true -jar tsr.jar \
--spring.datasource.url=$RDS_JDBC_DATABASE_URL \
--spring.datasource.username=$RDS_USERNAME \
--spring.datasource.password=$RDS_PASSWORD \
--spring.security.oauth2.client.registration.keycloak.clientSecret=$TSR_KEYCLOAK_SECRET_KEY \
--spring.security.oauth2.client.provider.keycloak.issuer-uri=$TSR_KEYCLOAK_HOST \
--spring.security.oauth2.resourceserver.jwt.jwk-set-uri=$TSR_KEYCLOAK_JWK
