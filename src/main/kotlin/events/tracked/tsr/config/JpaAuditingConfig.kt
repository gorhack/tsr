package events.tracked.tsr.config

import events.tracked.tsr.user.userId
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.auditing.DateTimeProvider
import org.springframework.data.domain.AuditorAware
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.oauth2.jwt.Jwt
import java.time.ZonedDateTime
import java.util.*

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider", dateTimeProviderRef = "auditingDateTimeProvider")
class JpaAuditingConfiguration {
    @Bean
    fun auditorProvider(): AuditorAware<String> {
        return AuditorAware<String> {
            val principal = SecurityContextHolder.getContext()?.authentication?.principal
                ?: return@AuditorAware Optional.ofNullable("system")
            when (principal) {
                is OidcUser -> {
                    Optional.ofNullable(principal.userId)
                }
                is Jwt -> {
                    Optional.ofNullable(principal.subject)
                }
                else -> {
                    Optional.empty()
                }
            }
        }
    }

    @Bean // Makes ZonedDateTime compatible with auditing fields
    fun auditingDateTimeProvider() = DateTimeProvider { Optional.of(ZonedDateTime.now()) }
}