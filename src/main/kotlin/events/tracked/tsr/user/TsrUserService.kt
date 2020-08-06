package events.tracked.tsr.user

import org.springframework.stereotype.Service
import org.springframework.security.oauth2.core.oidc.user.OidcUser

@Service
class TsrUserService(private val tsrUserRepository: TsrUserRepository) {
    fun assertUserExistsAndReturnUser(user: OidcUser): TsrUser {
        val maybeUser = tsrUserRepository.findByUserId(user.userId)
        if (maybeUser == null) {
            val role: UserRole = if (isEmpty()) UserRole.ADMIN else UserRole.USER
            val userName = user.preferredUsername ?: user.userName
            val newUser = TsrUser(userId = user.userId, username = userName, role = role)
            return tsrUserRepository.save(newUser)
        }
        return maybeUser;
    }
    fun assertUserIsAdmin(user: OidcUser): Boolean {
        val receivedUser = tsrUserRepository.findByUserId(user.userId)
        val maybeUser = receivedUser ?: return false
        return maybeUser.role == UserRole.ADMIN
    }

    fun updateUserRole(userRoleUpdate: UserRoleUpdateDTO) {
        val tsrUser = tsrUserRepository.findByUserId(userRoleUpdate.userId) ?:
        throw IllegalArgumentException()
        tsrUserRepository.save(tsrUser.copy(role = userRoleUpdate.role))
    }
    fun isEmpty(): Boolean = tsrUserRepository.count() == 0L
}