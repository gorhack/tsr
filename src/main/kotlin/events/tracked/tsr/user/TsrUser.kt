package events.tracked.tsr.user

import events.tracked.tsr.organization.Organization
import events.tracked.tsr.organization.OrganizationDTO
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import java.util.*
import javax.persistence.*

@Entity
@Table(name = "tsr_user")
data class TsrUser(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val tsrUserId: Long = 0L,
    val userId: String = "",
    val username: String = "",
    @Enumerated(EnumType.STRING)
    var role: UserRole = UserRole.ADMIN,
    @ManyToMany(cascade = [CascadeType.MERGE], fetch = FetchType.LAZY)
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
    private fun addOrganization(organization: Organization) {
        organizations = organizations.plus(organization)
        organization.tsrUsers = organization.tsrUsers.plus(this)
    }

    private fun removeOrganization(organization: Organization) {
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
        return tsrUserId == other.tsrUserId
    }

    @Override
    override fun hashCode(): Int {
        return Objects.hash(this.tsrUserId)
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
    val organizations: Set<OrganizationDTO> = hashSetOf(),
    val phoneNumber: String? = null,
    val emailAddress: String? = null
)

data class TsrUserDTO(
    val userId: String = "",
    val username: String = "",
    val role: UserRole = UserRole.USER,
    val settings: UserSettingsDTO = UserSettingsDTO()
) {
    constructor(tsrUser: TsrUser) : this(
        userId = tsrUser.userId,
        username = tsrUser.username,
        role = tsrUser.role,
        settings = UserSettingsDTO(
            organizations = tsrUser.organizations.map { org -> org.toOrganizationDTO() }.toHashSet(),
            phoneNumber = tsrUser.phoneNumber,
            emailAddress = tsrUser.emailAddress)
    )
}