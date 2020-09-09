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
    fun getAllEventTypes(page: Int, size: Int, sortBy: Sort): PageDTO<EventType> {
        val paging: Pageable = PageRequest.of(page, size, sortBy)
        val eventPage = eventTypeRepository.findAll(paging)
        return if (eventPage.hasContent()) {
            PageDTO(eventPage)
        } else {
            PageDTO()
        }
    }

    fun getEventTypeContains(searchTerm: String, page: Int, size: Int, sortBy: Sort): PageDTO<EventType> {
        println(searchTerm)
        val paging: Pageable = PageRequest.of(page, size, sortBy)
        val eventPage = eventTypeRepository.findByDisplayNameContains(searchTerm, paging)
        return if (eventPage.hasContent()) {
            PageDTO(eventPage)
        } else {
            PageDTO()
        }
    }
}
