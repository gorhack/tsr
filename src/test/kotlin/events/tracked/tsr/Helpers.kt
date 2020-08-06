package events.tracked.tsr

import io.mockk.every
import io.mockk.mockk
import org.springframework.security.oauth2.core.oidc.user.OidcUser

fun makeOidcUser(userId: String, userName: String): OidcUser {
    val claims = mutableMapOf<String, Any>(
            "user_name" to userName,
            "sub" to userId
    )
    val mockOidcUser = mockk<OidcUser>()
    every { mockOidcUser.attributes } returns claims
    return mockOidcUser
}