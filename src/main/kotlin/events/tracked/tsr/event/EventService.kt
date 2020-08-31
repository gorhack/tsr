package events.tracked.tsr.event

import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class EventService(
        private val eventRepository: EventRepository,
        private val eventTypeRepository: EventTypeRepository
) {
    fun saveEvent(eventDTO: EventDTO): EventDTO {
        val savedEvent = eventRepository.save(eventDTO.toEvent())
        return savedEvent.toEventDTO()
    }

    fun getAllEvents(): List<EventDTO> {
        val allEvents: List<Event> = eventRepository.findAll()
        return allEvents.map { e -> e.toEventDTO() }
    }

    fun getAllEventTypes(): List<EventType> {
        return eventTypeRepository.findAll();
    }

    fun getEventById(eventId: Int): EventDTO {
        val event: Event = eventRepository.findByIdOrNull(eventId.toLong())
                ?: throw EmptyResultDataAccessException(1)
        return event.toEventDTO()
    }
}
