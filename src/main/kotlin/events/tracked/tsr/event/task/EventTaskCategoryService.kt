package events.tracked.tsr.event.task

import events.tracked.tsr.PageDTO
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service

@Service
class EventTaskCategoryService (
    val eventTaskCategoryRepository: EventTaskCategoryRepository
) {
    fun getEventTaskCategories(page: Int, size: Int, sortBy: Sort): PageDTO<EventTaskCategory> {
        val paging: Pageable = PageRequest.of(page, size, sortBy)
        val pagedEventResults: Page<EventTaskCategory> = eventTaskCategoryRepository.findAll(paging)
        return if (pagedEventResults.hasContent()) {
            PageDTO(pagedEventResults)
        } else {
            PageDTO()
        }
    }

}
