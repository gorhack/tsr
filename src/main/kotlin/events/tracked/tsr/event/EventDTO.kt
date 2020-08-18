package events.tracked.tsr.event

import java.time.LocalDateTime

data class EventDTO(
        val eventId: Long? = null,
        val organization: String,
        val startDate: LocalDateTime,
        val endDate: LocalDateTime,
        val eventType: EventType?,
        val createdDate: LocalDateTime? = null,
        val lastModifiedDate: LocalDateTime? = null
) {
    constructor(event: Event) :
            this(
                    event.eventId,
                    event.organization,
                    event.startDate,
                    event.endDate,
                    event.eventType,
                    event.createdDate,
                    event.lastModifiedDate
            )
}
