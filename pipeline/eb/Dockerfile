FROM openjdk:13-alpine

ENV RDS_DB_NAME=tsr
ENV RDS_PASSWORD=tsr
ENV RDS_USERNAME=tsr
ENV SPRING_PROFILES_ACTIVE=default

COPY tsr.jar /tsr.jar

EXPOSE 8080

ENTRYPOINT ["/opt/openjdk-13/bin/java","-Djava.net.preferIPv4Stack=true", "-jar", "tsr.jar"]
