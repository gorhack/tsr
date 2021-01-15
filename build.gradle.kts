import com.moowork.gradle.node.yarn.YarnTask
import org.gradle.api.tasks.testing.logging.TestExceptionFormat
import org.gradle.api.tasks.testing.logging.TestLogEvent
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
	id("org.springframework.boot") version "2.4.2"
	id("io.spring.dependency-management") version "1.0.10.RELEASE"
	id("com.moowork.node") version "1.3.1"
	id("org.flywaydb.flyway") version "7.5.0"
	id("org.sonarqube") version "3.1"

	id ("org.jetbrains.kotlin.plugin.jpa") version "1.4.21"
	id ("org.jetbrains.kotlin.plugin.noarg") version "1.4.21"
	kotlin("jvm") version "1.4.21"
	kotlin("plugin.spring") version "1.4.21"

	id("com.github.ben-manes.versions") version "0.36.0" // helps find latest dependency versions `./gradlew dependencyUpdates`
}

group = "events.tracked.tsr"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_13

node {
	nodeModulesDir = file("${project.projectDir}/client")
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

var springSecurityVersion = "5.4.2"
var springBootVersion = "2.4.1"
var keycloakVersion = "11.0.0"
var jacksonVersion = "2.12.1"
var jetBrainsKotlin = "1.4.21"

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa:${springBootVersion}")
	implementation("org.springframework.boot:spring-boot-starter-web:${springBootVersion}")
	implementation("org.springframework.boot:spring-boot-starter-actuator:${springBootVersion}")
	implementation("org.springframework.boot:spring-boot-starter-websocket:${springBootVersion}")
	implementation("org.flywaydb:flyway-core:7.5.0")

	// Deserialize json
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin:${jacksonVersion}")
	implementation("com.fasterxml.jackson.module:jackson-module-paranamer:${jacksonVersion}")

	implementation("org.jetbrains.kotlin:kotlin-reflect:${jetBrainsKotlin}")
	implementation("org.jetbrains.kotlin:kotlin-stdlib-js:${jetBrainsKotlin}")
	implementation("jakarta.persistence:jakarta.persistence-api:2.2.3")

	// SSO - Security
	implementation("org.springframework.boot:spring-boot-starter-security:${springBootVersion}")

	implementation("org.springframework.security:spring-security-oauth2-client:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-web:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-config:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-core:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-oauth2-jose:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-oauth2-resource-server:${springSecurityVersion}")
	implementation("org.springframework.security.oauth:spring-security-oauth2:2.5.0.RELEASE")
	implementation("org.springframework.session:spring-session-jdbc:2.4.1")

	implementation("org.hibernate.validator:hibernate-validator-cdi:7.0.0.Final")

	runtimeOnly("org.postgresql:postgresql:42.2.18")

	testImplementation("org.springframework.boot:spring-boot-starter-test:${springBootVersion}")
	testImplementation("io.mockk:mockk:1.10.5")
}

tasks.withType<KotlinCompile> {
	kotlinOptions {
		freeCompilerArgs = listOf("-Xjsr305=strict")
		jvmTarget = "13"
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

tasks.register("yarnBuild", YarnTask::class) {
	setWorkingDir("client")
	args = listOf("build")
	dependsOn("yarnInstall")
}
tasks.register("yarnInstall", YarnTask::class) {
	setWorkingDir("client")
	args = listOf("install")
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