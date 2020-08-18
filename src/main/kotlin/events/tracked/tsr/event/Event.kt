package events.tracked.tsr.event

import events.tracked.tsr.jpa_ext.Auditable
import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "event")
data class Event(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var eventId: Long = 0,
        var eventName: String? = "",
        var organization: String = "",
        var startDate: LocalDateTime = LocalDateTime.parse("1970-01-01T00:00:01"),
        var endDate: LocalDateTime = LocalDateTime.parse("1970-01-01T00:00:01"),

        @ManyToOne(fetch = FetchType.LAZY, optional = true)
        @JoinColumn(name = "event_type_id", nullable = true)
        var eventType: EventType? = null
) : Auditable() {
    constructor(eventId: Long, eventName: String?, organization: String, startDate: LocalDateTime, endDate: LocalDateTime):
            this(eventId = eventId, eventName = eventName, organization = organization, startDate = startDate, endDate = endDate, eventType = null)

    fun toEventDTO(): EventDTO {
        return EventDTO(
                eventId = eventId,
                eventName = eventName,
                organization = organization,
                startDate = startDate,
                endDate = endDate,
                eventType = eventType,
                createdDate = createdDate,
                lastModifiedDate = lastModifiedDate
        )
    }
}