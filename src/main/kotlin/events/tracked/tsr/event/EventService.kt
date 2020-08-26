package events.tracked.tsr.event

import org.springframework.stereotype.Service

@Service
class EventService(
        private val eventRepository: EventRepository,
        private val eventTypeRepository: EventTypeRepository
) {
    fun saveEvent(eventDTO: EventDTO): EventDTO {
        val savedEvent = eventRepository.save(eventDTO.toEvent())
        return EventDTO(savedEvent)
    }

    fun getAllEventTypes(): List<EventType> {
        return eventTypeRepository.findAll();
    }
}