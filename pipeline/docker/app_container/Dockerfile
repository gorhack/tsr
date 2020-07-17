FROM openjdk:13-alpine

ENV TSR_DATABASE=tsr
ENV TSR_DB_PASS=tsr
ENV TSR_DB_USER=tsr
ENV SPRING_PROFILES_ACTIVE=default

ADD tsr.jar /tsr.jar

EXPOSE 8080

ENTRYPOINT ["/opt/openjdk-13/bin/java","-Djava.net.preferIPv4Stack=true", "-jar", "tsr.jar"]
