package events.tracked.tsr.event

import events.tracked.tsr.NewTsrEventSaveEvent
import events.tracked.tsr.PageDTO
import events.tracked.tsr.UpdateTsrEventSaveEvent
import events.tracked.tsr.organization.Organization
import events.tracked.tsr.user.TsrUserRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
class EventService(
    private val eventRepository: EventRepository,
    private val userRepository: TsrUserRepository,
    private val applicationEventPublisher: ApplicationEventPublisher
) {
    @Transactional
    fun saveEvent(eventDTO: EventDTO): EventDTO {
        val savedEvent = eventRepository.saveAndFlush(eventDTO.toEvent())
        applicationEventPublisher.publishEvent(NewTsrEventSaveEvent(this, savedEvent))
        return savedEvent.toEventDTO()
    }

    fun getActiveEvents(page: Int, size: Int, sortBy: Sort): PageDTO<EventDTO> {
        val paging: Pageable = PageRequest.of(page, size, sortBy)
        val dateUtc = OffsetDateTime.now()
        val pagedEventResults: Page<Event> = eventRepository.findByEndDateGreaterThanEqual(
            dateUtc,
            paging
        )

        return if (pagedEventResults.hasContent()) {
            PageDTO(pagedEventResults.map { e -> e.toEventDTO() })
        } else {
            PageDTO()
        }
    }

    fun getActiveEventsByUserId(userId: String, page: Int, size: Int, sortBy: Sort): PageDTO<EventDTO> {
        val paging: Pageable = PageRequest.of(page, size, sortBy)
        val dateUtc = OffsetDateTime.now()
        val pagedEvents = eventRepository.findByCreatedByAndEndDateGreaterThanEqual(userId, dateUtc, paging)
        return if (pagedEvents.hasContent()) {
            PageDTO(pagedEvents.map { e -> e.toEventDTO() })
        } else {
            PageDTO()
        }
    }

    fun getActiveEventsByOrganizationIds(
        organizations: MutableList<Organization>,
        page: Int,
        size: Int,
        sortBy: Sort
    ): PageDTO<EventDTO> {
        val paging: Pageable = PageRequest.of(page, size, sortBy)
        val dateUtc = OffsetDateTime.now()
        val pagedEvents = eventRepository.findByOrganizationInAndEndDateGreaterThanEqual(
            organizations,
            dateUtc,
            paging
        )
        return if (pagedEvents.hasContent()) {
            PageDTO(pagedEvents.map { e -> e.toEventDTO() })
        } else {
            PageDTO()
        }
    }

    fun getEventById(eventId: Int): Event {
        return eventRepository.findByIdOrNull(eventId.toLong())
            ?: throw EmptyResultDataAccessException(1)
    }

    fun getEventDTOById(eventId: Int): EventDTO {
        val event = getEventById(eventId)
        val createdByUser: String = userRepository.findByUserId(event.createdBy)?.username
            ?: "[deleted]"
        var lastModifiedByUser: String = createdByUser
        if (event.createdBy != event.lastModifiedBy) {
            lastModifiedByUser = userRepository.findByUserId(event.lastModifiedBy)?.username
                ?: "[deleted]"
        }
        return event.toEventDTO(createdByDisplayName = createdByUser, lastModifiedByDisplayName = lastModifiedByUser)
    }

    @Transactional
    fun updateEvent(eventDTO: EventDTO): EventDTO {
        val updatedEvent = eventRepository.saveAndFlush(eventDTO.toEvent())
        applicationEventPublisher.publishEvent(UpdateTsrEventSaveEvent(this, updatedEvent))
        return updatedEvent.toEventDTO()
    }
}
