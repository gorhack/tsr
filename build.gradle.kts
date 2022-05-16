import com.github.gradle.node.yarn.task.YarnTask
import org.gradle.api.tasks.testing.logging.TestExceptionFormat
import org.gradle.api.tasks.testing.logging.TestLogEvent
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
	id("org.springframework.boot") version "2.6.6"
	id("io.spring.dependency-management") version "1.0.11.RELEASE"
	id("com.github.node-gradle.node") version "3.2.1"
	id("org.flywaydb.flyway") version "8.5.5"
	id("org.sonarqube") version "3.3"

	id ("org.jetbrains.kotlin.plugin.jpa") version "1.6.10"
	id ("org.jetbrains.kotlin.plugin.noarg") version "1.6.10"
	kotlin("jvm") version "1.6.10"
	kotlin("plugin.spring") version "1.6.10"

	id("com.github.ben-manes.versions") version "0.42.0" // helps find latest dependency versions `./gradlew dependencyUpdates`
}

group = "events.tracked.tsr"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_17

node {
	download.set(false)
	yarnWorkDir.set(file("${project.projectDir}/client"))
	nodeProjectDir.set(file("${project.projectDir}/client"))
	yarnWorkDir.set(file("${project.projectDir}/.gradle/yarn"))
}

noArg {
	invokeInitializers = true
}

flyway {
	user = "tsr"
	password = "tsr"
	url = "jdbc:postgresql://localhost:5432/tsr"
}

repositories {
	mavenCentral()
	maven { url = uri("https://repo.spring.io/milestone") }
	maven { url = uri("https://repo.spring.io/snapshot") }
}

var springSecurityVersion = "5.6.2"
var springBootVersion = "2.6.5"
var jacksonVersion = "2.13.2"
var jetBrainsKotlin = "1.6.10"

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa:${springBootVersion}")
	implementation("org.springframework.boot:spring-boot-starter-web:${springBootVersion}")
	implementation("org.springframework.boot:spring-boot-starter-actuator:${springBootVersion}")
	implementation("org.springframework.boot:spring-boot-starter-websocket:${springBootVersion}")
	implementation("org.flywaydb:flyway-core:8.5.11")

	// Deserialize json
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin:${jacksonVersion}")
	implementation("com.fasterxml.jackson.module:jackson-module-paranamer:${jacksonVersion}")

	implementation("org.jetbrains.kotlin:kotlin-reflect:${jetBrainsKotlin}")
	implementation("org.jetbrains.kotlin:kotlin-stdlib-js:${jetBrainsKotlin}")
	implementation("jakarta.persistence:jakarta.persistence-api:2.2.3")

	// SSO - Security
	implementation("org.springframework.boot:spring-boot-starter-security:${springBootVersion}")

	implementation("org.springframework.security:spring-security-oauth2-client:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-config:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-core:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-oauth2-jose:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-oauth2-resource-server:${springSecurityVersion}")
	implementation("org.springframework.security.oauth:spring-security-oauth2:2.5.1.RELEASE")
	implementation("org.springframework.session:spring-session-jdbc:2.6.2")

	implementation("org.hibernate.validator:hibernate-validator-cdi:7.0.4.Final")

	runtimeOnly("org.postgresql:postgresql:42.3.3")

	testImplementation("org.springframework.boot:spring-boot-starter-test:${springBootVersion}")
	testImplementation("io.mockk:mockk:1.12.3")
}

tasks.withType<KotlinCompile> {
	kotlinOptions {
		freeCompilerArgs = listOf("-Xjsr305=strict")
		jvmTarget = "17"
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
	failFast = true
	testLogging {
		info {
			events(
					TestLogEvent.STARTED,
					TestLogEvent.FAILED,
					TestLogEvent.PASSED,
					TestLogEvent.SKIPPED
			)
			exceptionFormat = TestExceptionFormat.FULL
			showStandardStreams = true
			showCauses = true
			showStackTraces = true
		}
	}
}

tasks.getByName<YarnTask>("yarn_build") {
	dependsOn("yarn_install")
}

tasks.getByName<YarnTask>("yarn_test") {
	dependsOn("yarn_build")
	environment.put("CI", "true")
}

tasks.getByName<Jar>("jar") {
	// disable plain archive
	enabled = false
}

subprojects {
	tasks.named("yarnBuild", YarnTask::class) {
		doLast {
			println("    built from ${this.project.name}")
		}
	}
}

tasks.register("cleanStatic", Delete::class) {
	delete("src/main/resources/static")
}
project.tasks["clean"].dependsOn("cleanStatic")