package events.tracked.tsr.config

import events.tracked.tsr.config.CsrfHelpers.csrfHeaderFilter
import events.tracked.tsr.config.CsrfHelpers.csrfTokenRepository
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.session.SessionManagementFilter

@EnableWebSecurity
class SecurityConfiguration {

    @Throws(Exception::class)
    fun configure(http: HttpSecurity) {
        http.csrf().csrfTokenRepository(csrfTokenRepository())
                .and().addFilterAfter(csrfHeaderFilter(true), SessionManagementFilter::class.java)
                .headers().frameOptions().sameOrigin()

        http.authorizeRequests()
                .antMatchers("/actuator/health", "/actuator/info").permitAll()
                .anyRequest().authenticated()
                .and()
                .logout()
                .deleteCookies("JSESSIONID", "XSRF-TOKEN")
                .and()
                .oauth2Login()
                .userInfoEndpoint()
        http.oauth2ResourceServer().jwt()

    }
}
