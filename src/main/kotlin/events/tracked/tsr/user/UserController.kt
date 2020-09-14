package events.tracked.tsr.user

import com.sun.mail.iap.Response
import events.tracked.tsr.organization.OrganizationDTO
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/user")
class UserController(private val tsrUserService: TsrUserService) {
    @GetMapping
    fun userInfo(@AuthenticationPrincipal user: OidcUser): TsrUserDTO {
        val tsrUser = tsrUserService.assertUserExistsAndReturnUser(user)
        return TsrUserDTO(tsrUser)
    }

    @PutMapping("/role")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun saveUserRole(
            @AuthenticationPrincipal user: OidcUser,
            @RequestBody userRoleUpdate: UserRoleUpdateDTO
    ) {
        if (tsrUserService.assertUserIsAdmin(user)) {
            tsrUserService.updateUserRole(userRoleUpdate)
        }
    }

    @PutMapping("/organizations")
    fun setUserOrganizations(
        @AuthenticationPrincipal user: OidcUser,
        @RequestBody organizations: List<OrganizationDTO>
    ): ResponseEntity<TsrUser> {
        val tsrUser = tsrUserService.assertUserExistsAndReturnUser(user)
        return ResponseEntity<TsrUser>(tsrUserService.setUserOrganizations(tsrUser, organizations), HttpHeaders(), HttpStatus.OK)
    }
}