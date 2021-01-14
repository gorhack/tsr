package events.tracked.tsr.user

import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.stereotype.Service

@Service
class TsrUserService(private val tsrUserRepository: TsrUserRepository) {
    fun findByUserId(userId: String): TsrUser? {
        return tsrUserRepository.findByUserId(userId)
    }

    fun assertUserExistsAndReturnUser(user: OidcUser): TsrUser {
        val maybeUser = tsrUserRepository.findByUserId(user.userId)
        if (maybeUser == null) {
            val hasAdminRole = user.authorities.contains(SimpleGrantedAuthority("SCOPE_tsr.admin"))
            val role: UserRole = if (isEmpty() || hasAdminRole) UserRole.ADMIN else UserRole.USER
            val userName = user.preferredUsername ?: user.userName
            return tsrUserRepository.saveAndFlush(TsrUser(userId = user.userId, username = userName, role = role))
        }
        return maybeUser
    }

    fun assertUserIsAdmin(user: OidcUser): Boolean {
        val receivedUser = tsrUserRepository.findByUserId(user.userId)
        val maybeUser = receivedUser ?: return false
        return maybeUser.role == UserRole.ADMIN
    }

    fun updateUserRole(userRoleUpdate: UserRoleUpdateDTO) {
        val tsrUser = tsrUserRepository.findByUserId(userRoleUpdate.userId) ?: throw IllegalArgumentException()
        tsrUser.role = userRoleUpdate.role
        tsrUserRepository.save(tsrUser)
    }

    fun isEmpty(): Boolean = tsrUserRepository.count() == 0L

    fun setUserSettings(oidcUser: OidcUser, userSettings: UserSettingsDTO): TsrUser {
        val userToUpdate = assertUserExistsAndReturnUser(oidcUser)
        userToUpdate.updateOrganizations(userSettings.organizations.map { o -> o.toOrganization() }.toHashSet())
        userToUpdate.emailAddress = userSettings.emailAddress
        userToUpdate.phoneNumber = userSettings.phoneNumber
        return tsrUserRepository.save(userToUpdate)
    }
}