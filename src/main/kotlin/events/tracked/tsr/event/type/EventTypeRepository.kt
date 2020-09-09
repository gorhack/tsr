package events.tracked.tsr.event.type

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface EventTypeRepository : PagingAndSortingRepository<EventType, Long> {
    fun findByDisplayNameContains(searchVal: String, paging: Pageable): Page<EventType>
}
