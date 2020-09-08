import com.moowork.gradle.node.yarn.YarnTask
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
	id("org.springframework.boot") version "2.4.0-SNAPSHOT"
	id("io.spring.dependency-management") version "1.0.10.RELEASE"
	id("com.moowork.node") version "1.3.1"
	id("org.flywaydb.flyway") version "6.5.5"
	id("org.sonarqube") version "3.0"

	id ("org.jetbrains.kotlin.plugin.jpa") version "1.4.0"
	id ("org.jetbrains.kotlin.plugin.noarg") version "1.4.0"
	kotlin("jvm") version "1.4.0"
	kotlin("plugin.spring") version "1.4.0"

	id("com.github.ben-manes.versions") version "0.31.0" // helps find latest dependency versions `./gradlew dependencyUpdates`
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

var springSecurityVersion = "5.3.3.RELEASE"
var springBootVersion = "2.3.3.RELEASE"
var keycloakVersion = "11.0.0"
var jacksonVersion = "2.11.2"
var jetBrainsKotlin = "1.4.0"

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa:${springBootVersion}")
	implementation("org.springframework.boot:spring-boot-starter-web:${springBootVersion}")
	implementation("org.springframework.boot:spring-boot-starter-actuator:${springBootVersion}")
	implementation("org.flywaydb:flyway-core:6.5.2")

	// Deserialize json
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin:${jacksonVersion}")
	implementation("com.fasterxml.jackson.module:jackson-module-paranamer:${jacksonVersion}")

	implementation("org.jetbrains.kotlin:kotlin-reflect:${jetBrainsKotlin}")
	implementation("org.jetbrains.kotlin:kotlin-stdlib-js:${jetBrainsKotlin}")
	implementation("jakarta.persistence:jakarta.persistence-api:2.2.3")

	// SSO - Security
	implementation("org.springframework.boot:spring-boot-starter-security:${springBootVersion}")
	implementation("org.springframework.boot:spring-boot-starter-oauth2-client:${springBootVersion}")
	implementation("org.springframework.security:spring-security-web:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-config:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-core:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-oauth2-jose:${springSecurityVersion}")
	implementation("org.springframework.security:spring-security-oauth2-resource-server:${springSecurityVersion}")
	implementation("org.springframework.security.oauth:spring-security-oauth2:2.5.0.RELEASE")
	implementation("org.springframework.session:spring-session-jdbc:2.3.0.RELEASE")

	implementation("org.hibernate.validator:hibernate-validator-cdi:6.1.5.Final")

	runtimeOnly("org.postgresql:postgresql:42.2.16")

	testImplementation("org.springframework.boot:spring-boot-starter-test:${springBootVersion}")
	testImplementation("io.mockk:mockk:1.10.0")
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
					org.gradle.api.tasks.testing.logging.TestLogEvent.STARTED,
					org.gradle.api.tasks.testing.logging.TestLogEvent.FAILED,
					org.gradle.api.tasks.testing.logging.TestLogEvent.PASSED,
					org.gradle.api.tasks.testing.logging.TestLogEvent.SKIPPED
			)
			exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
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