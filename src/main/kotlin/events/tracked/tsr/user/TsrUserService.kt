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
    fun isEmpty(): Boolean = tsrUserRepository.count() == 0L
}