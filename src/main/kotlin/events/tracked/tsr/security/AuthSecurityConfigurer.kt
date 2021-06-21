//package events.tracked.tsr.security
//
//import org.springframework.security.config.annotation.web.builders.HttpSecurity
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
//import org.springframework.security.web.util.matcher.AntPathRequestMatcher
//import org.springframework.stereotype.Component
//
//@Component
//@EnableWebSecurity
//class AuthSecurityConfigurer: HttpSecurityConfigurer {
//    override fun configure(http: HttpSecurity) {
//        http.logout()
//                .logoutRequestMatcher(AntPathRequestMatcher("/logout", "GET"))
//    }
//}