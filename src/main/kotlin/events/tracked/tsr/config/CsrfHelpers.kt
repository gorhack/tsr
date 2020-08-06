package events.tracked.tsr.config

import org.springframework.security.web.csrf.CsrfToken
import org.springframework.security.web.csrf.CsrfTokenRepository
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.util.WebUtils
import java.io.IOException
import javax.servlet.Filter
import javax.servlet.FilterChain
import javax.servlet.ServletException
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

object CsrfHelpers {

    fun csrfHeaderFilter(isSecure: Boolean): Filter {
        return object : OncePerRequestFilter() {
            @Throws(ServletException::class, IOException::class)
            override fun doFilterInternal(request: HttpServletRequest,
                                          response: HttpServletResponse,
                                          filterChain: FilterChain) {
                val csrf = request.getAttribute(CsrfToken::class.java.name) as CsrfToken
                var cookie = WebUtils.getCookie(request, "XSRF-TOKEN")
                val token = csrf.token
                if (cookie == null || token != null && token != cookie.value) {
                    cookie = Cookie("XSRF-TOKEN", token)
                    cookie.path = "/"
                    response.addCookie(cookie)
                }
                cookie.secure = isSecure
                filterChain.doFilter(request, response)
            }
        }
    }

    fun csrfTokenRepository(): CsrfTokenRepository {
        val repository = HttpSessionCsrfTokenRepository()
        repository.setHeaderName("X-XSRF-TOKEN")
        return repository
    }
}