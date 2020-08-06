package events.tracked.tsr

import io.mockk.every
import io.mockk.mockk
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames
import org.springframework.security.oauth2.core.oidc.OidcIdToken
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import java.time.Instant
import java.util.*

fun makeOidcUser(userId: String, userName: String): OidcUser {
    val claims = mutableMapOf<String, Any>(
            "user_name" to userName,
            "sub" to userId
    )
    val mockOidcUser = mockk<OidcUser>()
    every { mockOidcUser.attributes } returns claims
    return mockOidcUser
}

fun makeIdToken(claims: MutableMap<String, Any> = mutableMapOf()): OidcIdToken {
    claims.putIfAbsent(IdTokenClaimNames.SUB, UUID.randomUUID().toString())

    return OidcIdToken("id-token", Instant.now(), Instant.now().plusSeconds(3600), claims)
}