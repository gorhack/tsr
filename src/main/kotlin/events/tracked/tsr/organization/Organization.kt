package events.tracked.tsr.organization

import events.tracked.tsr.jpa_ext.Auditable
import events.tracked.tsr.user.TsrUser
import java.time.OffsetDateTime
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
    @ManyToMany(mappedBy = "organizations", cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    private var tsrUsers: MutableList<TsrUser> = mutableListOf()
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
}