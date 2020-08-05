FROM jboss/keycloak:11.0.0
COPY /tsr-realm.json /
ENV KEYCLOAK_IMPORT=/tsr-realm.json
ENV KEYCLOAK_USER=tsr
ENV KEYCLOAK_PASSWORD=tsr

EXPOSE 8080

ENTRYPOINT [ "/opt/jboss/tools/docker-entrypoint.sh" ]

CMD ["-b", "0.0.0.0"]