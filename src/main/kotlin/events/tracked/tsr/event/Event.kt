package events.tracked.tsr.event

import events.tracked.tsr.jpa_ext.Auditable
import java.time.OffsetDateTime
import javax.persistence.*

@Entity
@Table(name = "event")
data class Event(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var eventId: Long = 0,
    var eventName: String = "",
    var organization: String = "",
    var startDate: OffsetDateTime = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
    var endDate: OffsetDateTime = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "event_type_id", nullable = true)
    var eventType: EventType? = null
) : Auditable() {
    constructor(eventId: Long, eventName: String, organization: String, startDate: OffsetDateTime, endDate: OffsetDateTime) :
        this(eventId = eventId, eventName = eventName, organization = organization, startDate = startDate, endDate = endDate, eventType = null)

    constructor(eventId: Long, eventName: String, organization: String, startDate: OffsetDateTime, endDate: OffsetDateTime, eventType: EventType?, lastModifiedDate: OffsetDateTime, lastModifiedBy: String, createdDate: OffsetDateTime, createdBy: String) :
        this(eventId = eventId, eventName = eventName, organization = organization, startDate = startDate, endDate = endDate, eventType = eventType) {
        this.lastModifiedDate = lastModifiedDate
        this.lastModifiedBy = lastModifiedBy
        this.createdDate = createdDate
        this.createdBy = createdBy
    }

    fun toEventDTO(): EventDTO {
        return EventDTO(
            eventId = eventId,
            eventName = eventName,
            organization = organization,
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

    fun toEventDTO(createdByDisplayName: String, lastModifiedByDisplayName: String): EventDTO {
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