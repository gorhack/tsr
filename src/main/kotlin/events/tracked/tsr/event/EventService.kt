package events.tracked.tsr.event

import events.tracked.tsr.PageDTO
import events.tracked.tsr.user.TsrUserRepository
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class EventService(
    private val eventRepository: EventRepository,
    private val eventTypeRepository: EventTypeRepository,
    private val userRepository: TsrUserRepository
) {
    fun saveEvent(eventDTO: EventDTO): EventDTO {
        val savedEvent = eventRepository.save(eventDTO.toEvent())
        return savedEvent.toEventDTO()
    }

    fun getAllEvents(page: Int, size: Int, sortBy: String): PageDTO<EventDTO> {
        val paging: Pageable = PageRequest.of(page, size, Sort.by(sortBy))
        val pagedEventResults: Page<Event> = eventRepository.findAll(paging)

        return if (pagedEventResults.hasContent()) {
            PageDTO(pagedEventResults.map { e -> e.toEventDTO() })
        } else {
            PageDTO(Page.empty())
        }
    }

    fun getAllEventTypes(): List<EventType> {
        return eventTypeRepository.findAll();
    }

    fun getEventById(eventId: Int): EventDTO {
        val event: Event = eventRepository.findByIdOrNull(eventId.toLong())
            ?: throw EmptyResultDataAccessException(1)

        val createdByUser: String = userRepository.findByUserId(event.createdBy)?.username
            ?: "[deleted]"
        var lastModifiedByUser: String = createdByUser
        if (event.createdBy != event.lastModifiedBy) {
            lastModifiedByUser = userRepository.findByUserId(event.lastModifiedBy)?.username
                ?: "[deleted]"
        }
        return event.toEventDTO(createdByDisplayName = createdByUser, lastModifiedByDisplayName = lastModifiedByUser)
    }

    fun getEventsByUserId(userId: String): List<EventDTO> {
        return eventRepository.findAllByCreatedBy(userId).map { e ->
            e.toEventDTO()
        }
    }
}
