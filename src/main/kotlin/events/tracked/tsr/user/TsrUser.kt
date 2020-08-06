package events.tracked.tsr.user

import org.springframework.security.oauth2.core.oidc.user.OidcUser
import javax.persistence.*

@Entity
@Table(name = "tsr_user")
data class TsrUser (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val userId: String,
    val username: String,
    @Enumerated(EnumType.STRING)
    val role: UserRole = UserRole.ADMIN
)

enum class UserRole {
    ADMIN,
    USER
}

val OidcUser.userId: String get() = this.attributes["sub"].toString()
val OidcUser.userName: String get() = this.attributes["user_name"].toString()

data class TsrUserDTO (
        val id: Long = 0,
        val userId: String,
        val username: String,
        val role: UserRole
) {
    constructor(tsrUser: TsrUser) : this(
            id = tsrUser.id,
            userId = tsrUser.userId,
            username = tsrUser.username,
            role = tsrUser.role)
}

data class UserRoleUpdateDTO (
        val role: UserRole,
        val userId: String
)