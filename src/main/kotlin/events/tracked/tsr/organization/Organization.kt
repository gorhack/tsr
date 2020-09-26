package events.tracked.tsr.organization

import events.tracked.tsr.event.Event
import events.tracked.tsr.jpa_ext.Auditable
import events.tracked.tsr.user.TsrUser
import java.time.OffsetDateTime
import java.util.*
import javax.persistence.*

@Entity
@Table(name = "organization")
data class Organization(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var organizationId: Long = 0,
    var organizationName: String = "",
    var organizationDisplayName: String = "",
    var sortOrder: Int = 0,
    @ManyToMany(mappedBy = "organizations", cascade = [CascadeType.MERGE])
    var events: Set<Event> = hashSetOf(),
    @ManyToMany(mappedBy = "organizations", cascade = [CascadeType.MERGE])
    var tsrUsers: Set<TsrUser> = hashSetOf()
) : Auditable() {
    constructor(organizationId: Long, organizationName: String, organizationDisplayName: String, sortOrder: Int, lastModifiedDate: OffsetDateTime, lastModifiedBy: String, createdDate: OffsetDateTime, createdBy: String) :
        this(organizationId = organizationId, organizationName = organizationName, organizationDisplayName = organizationDisplayName, sortOrder = sortOrder) {
        this.lastModifiedDate = lastModifiedDate
        this.lastModifiedBy = lastModifiedBy
        this.createdDate = createdDate
        this.createdBy = createdBy
    }

    fun toOrganizationDTO(): OrganizationDTO{
        return OrganizationDTO(this)
    }

    @Override
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Organization) return false
        return organizationId == other.organizationId
    }

    @Override
    override fun hashCode(): Int {
        return Objects.hash(this.organizationId)
    }

    @Override
    override fun toString(): String {
        return "Organization(organizationId=${organizationId}, organizationName=${organizationName}, organizationDisplayName=${organizationDisplayName}, sortOrder=${sortOrder})"
    }
}