package events.tracked.tsr.security

import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.stereotype.Component

@Component
class CommonSecurityConfigurer : HttpSecurityConfigurer {
    override fun configure(http: HttpSecurity) {
        configureCsrfProtection(http)
    }

    //line gives react the ability to read XSRF tokens
    // STIG ID: APSC-DV-002500
    private fun configureCsrfProtection(http: HttpSecurity) {
        http.csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
    }
}