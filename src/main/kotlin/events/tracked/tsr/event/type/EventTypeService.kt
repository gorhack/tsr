package events.tracked.tsr.event.type

import events.tracked.tsr.PageDTO
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service

@Service
class EventTypeService(
    private val eventTypeRepository: EventTypeRepository
) {
    fun getAllEventTypes(page: Int, size: Int, sortBy: Sort): PageDTO<EventTypeDTO> {
        val paging: Pageable = PageRequest.of(page, size, sortBy)
        val eventPage = eventTypeRepository.findAll(paging)
        return if (eventPage.hasContent()) {
            PageDTO(eventPage.map { e -> e.toEventTypeDTO() })
        } else {
            PageDTO()
        }
    }

    fun getEventTypeContains(searchTerm: String, page: Int, size: Int, sortBy: Sort): PageDTO<EventTypeDTO> {
        val paging: Pageable = PageRequest.of(page, size, sortBy)
        val eventPage = eventTypeRepository.findByDisplayNameContainsIgnoreCase(searchTerm, paging)
        return if (eventPage.hasContent()) {
            PageDTO(eventPage.map { e -> e.toEventTypeDTO() })
        } else {
            PageDTO()
        }
    }

    fun createEventType(eventTypeDTO: EventTypeDTO): EventTypeDTO {
        val totalEventTypes = eventTypeRepository.count()
        val savedEventType = eventTypeRepository.save(eventTypeDTO.toEventType().copy(sortOrder = (totalEventTypes + 1).toInt()))
        return EventTypeDTO(savedEventType)
    }
}
