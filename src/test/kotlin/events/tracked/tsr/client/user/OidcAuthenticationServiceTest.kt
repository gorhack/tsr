package events.tracked.tsr.client.user

import events.tracked.tsr.makeIdToken
import events.tracked.tsr.user.OidcAuthenticationService
import events.tracked.tsr.user.userId
import events.tracked.tsr.user.userName
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest
import org.springframework.security.oauth2.client.registration.ClientRegistration
import org.springframework.security.oauth2.core.AuthorizationGrantType
import org.springframework.security.oauth2.core.OAuth2AccessToken
import org.springframework.security.oauth2.core.oidc.OidcIdToken
import java.time.Instant
import java.util.*

class OidcAuthenticationServiceTest {
    @Test
    fun `returns SSO username and name of logged in user`() {
        val randomUuid = UUID.randomUUID().toString()
        val claims = mutableMapOf<String, Any>(
                "user_name" to "tsruser1",
                "sub" to randomUuid
        )

        val idToken = makeIdToken(claims)
        val oidcUserRequest = makeOidcUserRequest(idToken)

        val result = OidcAuthenticationService().loadUser(oidcUserRequest)

        assertEquals(randomUuid, result.userId)
        assertEquals("tsruser1", result.userName)
    }

    private fun makeOidcUserRequest(idToken: OidcIdToken): OidcUserRequest {
        val clientRegistration =
                ClientRegistration.withRegistrationId("test")
                        .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                        .clientId("tsr")
                        .tokenUri("example.com")
                        .build()

        val accessToken = OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, "token", Instant.now(), Instant.now().plusSeconds(3600))

        return OidcUserRequest(clientRegistration, accessToken, idToken)
    }
}