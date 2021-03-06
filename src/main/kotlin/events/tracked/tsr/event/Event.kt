package events.tracked.tsr.event

import events.tracked.tsr.event.type.EventType
import events.tracked.tsr.jpa_ext.Auditable
import events.tracked.tsr.organization.Organization
import java.time.OffsetDateTime
import java.util.*
import javax.persistence.*

@Entity
@Table(name = "event")
data class Event(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val eventId: Long = 0L,
    var eventName: String = "",
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var startDate: OffsetDateTime = OffsetDateTime.parse("1970-01-01T00:00:01-00:00"),
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var endDate: OffsetDateTime = OffsetDateTime.parse("1970-01-01T00:00:01-00:00"),

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "event_type_id", nullable = true)
    var eventType: EventType? = null,

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "event_organization",
        joinColumns = [JoinColumn(name = "event_id")],
        inverseJoinColumns = [JoinColumn(name = "organization_id")]
    )
    var organizations: Set<Organization> = hashSetOf()


) : Auditable() {
    constructor(eventId: Long, eventName: String, organizations: Set<Organization>, startDate: OffsetDateTime, endDate: OffsetDateTime) :
        this(eventId = eventId, eventName = eventName, organizations = organizations, startDate = startDate, endDate = endDate, eventType = null)

    constructor(eventId: Long, eventName: String, organizations: Set<Organization>, startDate: OffsetDateTime, endDate: OffsetDateTime, eventType: EventType?, lastModifiedDate: OffsetDateTime, lastModifiedBy: String, createdDate: OffsetDateTime, createdBy: String) :
        this(eventId = eventId, eventName = eventName, organizations = organizations, startDate = startDate, endDate = endDate, eventType = eventType) {
        this.lastModifiedDate = lastModifiedDate
        this.lastModifiedBy = lastModifiedBy
        this.createdDate = createdDate
        this.createdBy = createdBy
    }

    // https://vladmihalcea.com/the-best-way-to-use-the-manytomany-annotation-with-jpa-and-hibernate/
    fun addOrganization(organization: Organization) {
        organizations = organizations.plus(organization)
        organization.events = organization.events.plus(this)
    }

    fun removeOrganization(organization: Organization) {
        organizations = organizations.minus(organization)
        organization.events = organization.events.minus(this)
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
        if (other !is Event) return false
        return eventId == other.eventId
    }

    @Override
    override fun hashCode(): Int {
        return Objects.hash(this.eventId)
    }

    fun toEventDTO(): EventDTO {
        return EventDTO(
            eventId = eventId,
            eventName = eventName,
            organizations = organizations.map { org -> org.toOrganizationDTO() }.toHashSet(),
            startDate = startDate,
            endDate = endDate,
            eventType = eventType,
            audit = AuditDTO(
                createdDate = createdDate!!,
                createdBy = createdBy,
                lastModifiedDate = lastModifiedDate!!,
                lastModifiedBy = lastModifiedBy
            )
        )
    }

    fun toEventDTOWithDisplayNames(createdByDisplayName: String, lastModifiedByDisplayName: String): EventDTO {
        return this.toEventDTO().copy(
            audit = AuditDTO(
                createdDate = createdDate!!,
                createdBy = createdBy,
                createdByDisplayName = createdByDisplayName,
                lastModifiedDate = lastModifiedDate!!,
                lastModifiedBy = lastModifiedBy,
                lastModifiedByDisplayName = lastModifiedByDisplayName
            )
        )
    }
}