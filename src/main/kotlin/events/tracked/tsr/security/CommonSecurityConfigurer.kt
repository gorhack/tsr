package events.tracked.tsr.security

import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.authentication.logout.HeaderWriterLogoutHandler
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.security.web.header.writers.ClearSiteDataHeaderWriter
import org.springframework.stereotype.Component

@Component
class CommonSecurityConfigurer : HttpSecurityConfigurer {
    override fun configure(http: HttpSecurity) {
        configureCsrfProtection(http)
        clearBrowserDataOnLogout(http)
        configureXssPreventionHeaders(http)
    }

    //line gives react the ability to read XSRF tokens
    // STIG ID: APSC-DV-002500
    private fun configureCsrfProtection(http: HttpSecurity) {
        http.csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
    }

    //clears session cookies and the temporary local browser storage
    //as per some STIG story
    private fun clearBrowserDataOnLogout(http: HttpSecurity) {
        val logoutHandler = HeaderWriterLogoutHandler(
                ClearSiteDataHeaderWriter(ClearSiteDataHeaderWriter.Directive.ALL)
        )
        http.logout().addLogoutHandler(logoutHandler)
    }

    //send xss prevention headers to browser
    //as per some STIG story
    private fun configureXssPreventionHeaders(http: HttpSecurity) {
        http.headers()
                .contentTypeOptions().and()
                .xssProtection()
                .xssProtectionEnabled(true)
                .block(true);
    }
}