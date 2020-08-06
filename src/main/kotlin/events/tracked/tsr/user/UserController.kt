package events.tracked.tsr.user

import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/user")
class UserController(private val tsrUserService: TsrUserService) {
    @GetMapping
    fun userInfo(@AuthenticationPrincipal user: OidcUser): TsrUserDTO {
        val tsrUser = tsrUserService.assertUserExistsAndReturnUser(user)
        return TsrUserDTO(tsrUser)
    }
}