package events.tracked.tsr.event

import events.tracked.tsr.event.type.EventType
import events.tracked.tsr.organization.Organization
import java.time.OffsetDateTime

data class AuditDTO(
    val createdDate: OffsetDateTime = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
    val createdBy: String = "",
    val createdByDisplayName: String? = null,
    val lastModifiedDate: OffsetDateTime = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
    val lastModifiedBy: String = "",
    val lastModifiedByDisplayName: String? = null
)

data class EventDTO(
    val eventId: Long? = null,
    val eventName: String = "",
    val organization: Organization,
    val startDate: OffsetDateTime,
    val endDate: OffsetDateTime,
    val eventType: EventType? = null,
    val audit: AuditDTO? = null
) {
    private fun copyInto(event: Event): Event {
        return event.copy(
            eventName = eventName,
            organization = organization,
            startDate = startDate,
            endDate = endDate,
            eventType = eventType
        )
    }

    fun toEvent(): Event {
        return copyInto(Event())
    }
}
