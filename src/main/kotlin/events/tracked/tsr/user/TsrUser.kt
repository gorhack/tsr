package events.tracked.tsr.user

import events.tracked.tsr.organization.Organization
import events.tracked.tsr.organization.OrganizationDTO
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import javax.persistence.*

@Entity
@Table(name = "tsr_user")
data class TsrUser(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val userId: String,
    val username: String,
    @Enumerated(EnumType.STRING)
    val role: UserRole = UserRole.ADMIN,
    @ManyToMany(cascade = [CascadeType.ALL])
    @JoinTable(
        name = "tsr_user_organization",
        joinColumns = [JoinColumn(name = "tsr_user_id")],
        inverseJoinColumns = [JoinColumn(name = "organization_id")]
    )
    val organizations: MutableList<Organization> = mutableListOf(),
    val phoneNumber: String? = null,
    val emailAddress: String? = null
)

enum class UserRole {
    ADMIN,
    USER
}

val OidcUser.userId: String get() = this.attributes["sub"].toString()
val OidcUser.userName: String get() = this.attributes["user_name"].toString()

data class TsrUserDTO(
    val id: Long = 0,
    val userId: String,
    val username: String,
    val role: UserRole,
    val organizations: MutableList<Organization>,
    val phoneNumber: String? = null,
    val emailAddress: String? = null
) {
    constructor(tsrUser: TsrUser) : this(
        id = tsrUser.id,
        userId = tsrUser.userId,
        username = tsrUser.username,
        role = tsrUser.role,
        organizations = tsrUser.organizations,
        phoneNumber = tsrUser.phoneNumber,
        emailAddress = tsrUser.emailAddress
    )
}

data class UserRoleUpdateDTO(
    val role: UserRole,
    val userId: String
)

data class UserSettingsDTO(
    val organizations: List<OrganizationDTO>,
    val phoneNumber: String?,
    val emailAddress: String?
) {
    constructor() : this(
        organizations = listOf(),
        phoneNumber = null,
        emailAddress = null
    )
}