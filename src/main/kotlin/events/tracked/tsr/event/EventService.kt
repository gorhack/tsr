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

    fun getAllEvents(): List<EventDTO> {
        val allEvents: List<Event> = eventRepository.findAll()
        return allEvents.map { e -> EventDTO(e) }
    }

    fun getAllEventTypes(): List<EventType> {
        return eventTypeRepository.findAll();
    }
}
