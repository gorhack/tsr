package events.tracked.tsr.user

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.stereotype.Service

@Service
class OidcAuthenticationService : OAuth2UserService<OidcUserRequest, OidcUser> {
    private val oidcUserServiceDelegate = OidcUserService()

    override fun loadUser(userRequest: OidcUserRequest): OidcUser {
        return oidcUserServiceDelegate.loadUser(userRequest)
    }
}