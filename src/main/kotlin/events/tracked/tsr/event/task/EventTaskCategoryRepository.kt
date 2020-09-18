package events.tracked.tsr.event.task

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface EventTaskCategoryRepository : PagingAndSortingRepository<EventTaskCategory, Long> {
    fun findByEventTaskDisplayNameContainsIgnoreCase(searchVal: String, paging: Pageable): Page<EventTaskCategory>
}