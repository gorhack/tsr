package events.tracked.tsr.event

import java.time.LocalDateTime

data class EventDTO(
        val eventId: Long? = null,
        val eventName: String = "",
        val organization: String,
        val startDate: LocalDateTime,
        val endDate: LocalDateTime,
        val eventType: EventType? = null,
        val createdDate: LocalDateTime? = null,
        val createdBy: String? = null,
        val lastModifiedDate: LocalDateTime? = null,
        val lastModifiedBy: String? = null
) {
    constructor(event: Event) :
            this(
                    event.eventId,
                    event.eventName,
                    event.organization,
                    event.startDate,
                    event.endDate,
                    event.eventType,
                    event.createdDate,
                    event.createdBy,
                    event.lastModifiedDate,
                    event.lastModifiedBy
            )

    private fun copyInto(event: Event) : Event {
        val eventCopy = event.copy(
                eventName = this.eventName,
                organization = this.organization,
                startDate = this.startDate,
                endDate = this.endDate,
                eventType = this.eventType
        )
        eventCopy.lastModifiedDate = event.lastModifiedDate
        eventCopy.lastModifiedBy = event.lastModifiedBy
        eventCopy.createdDate = event.createdDate
        eventCopy.createdBy = event.createdBy
        return eventCopy
    }

    fun toEvent(): Event {
        return copyInto(Event())
    }
}
