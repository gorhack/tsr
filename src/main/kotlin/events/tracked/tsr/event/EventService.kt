package events.tracked.tsr.event

import org.springframework.stereotype.Service

@Service
class EventService(
        private val eventRepository: EventRepository
) {
    fun saveEvent(eventDTO: EventDTO): EventDTO {
        val event = Event(
                eventName = eventDTO.eventName,
                organization = eventDTO.organization,
                eventType = eventDTO.eventType,
                startDate = eventDTO.startDate,
                endDate = eventDTO.endDate
        )
        return eventRepository.save(event).toEventDTO()
    }
}