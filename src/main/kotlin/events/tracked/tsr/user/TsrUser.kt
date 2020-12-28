package events.tracked.tsr.user

import events.tracked.tsr.organization.Organization
import events.tracked.tsr.organization.OrganizationDTO
import javax.persistence.*
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import java.util.*

@Entity
@Table(name = "tsr_user")
data class TsrUser(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val userId: String = "",
    val username: String = "",
    @Enumerated(EnumType.STRING)
    var role: UserRole = UserRole.ADMIN,
    @ManyToMany(cascade = [CascadeType.MERGE])
    @JoinTable(
        name = "tsr_user_organization",
        joinColumns = [JoinColumn(name = "tsr_user_id")],
        inverseJoinColumns = [JoinColumn(name = "organization_id")]
    )
    var organizations: Set<Organization> = hashSetOf(),
    var phoneNumber: String? = null,
    var emailAddress: String? = null
) {
    // https://vladmihalcea.com/the-best-way-to-use-the-manytomany-annotation-with-jpa-and-hibernate/
    fun addOrganization(organization: Organization) {
        organizations = organizations.plus(organization)
        organization.tsrUsers = organization.tsrUsers.plus(this)
    }

    fun removeOrganization(organization: Organization) {
        organizations = organizations.minus(organization)
        organization.tsrUsers = organization.tsrUsers.minus(this)
    }

    fun updateOrganizations(newOrganizations: Set<Organization>) {
        val added = newOrganizations.subtract(organizations)
        val removed = organizations.subtract(newOrganizations)
        added.map { organization -> this.addOrganization(organization) }
        removed.map { organization -> this.removeOrganization(organization) }
    }

    @Override
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is TsrUser) return false
        return id == other.id
    }

    @Override
    override fun hashCode(): Int {
        return Objects.hash(this.id)
    }
}

enum class UserRole {
    ADMIN,
    USER
}

val OidcUser.userId: String get() = this.attributes["sub"].toString()
val OidcUser.userName: String get() = this.attributes["user_name"].toString()

data class UserRoleUpdateDTO(
    val role: UserRole,
    val userId: String
)

data class UserSettingsDTO(
    val organizations: Set<OrganizationDTO>,
    val phoneNumber: String?,
    val emailAddress: String?
) {
    // required for jackson
    constructor() : this(
        organizations = hashSetOf(),
        phoneNumber = null,
        emailAddress = null
    )
}

data class TsrUserDTO(
    val id: Long = 0,
    val userId: String = "",
    val username: String = "",
    val role: UserRole = UserRole.USER,
    val settings: UserSettingsDTO = UserSettingsDTO()
) {
    constructor(tsrUser: TsrUser) : this(
        id = tsrUser.id,
        userId = tsrUser.userId,
        username = tsrUser.username,
        role = tsrUser.role,
        settings = UserSettingsDTO(
            organizations = tsrUser.organizations.map { org -> org.toOrganizationDTO() }.toHashSet(),
            phoneNumber = tsrUser.phoneNumber,
            emailAddress = tsrUser.emailAddress)
    )
}