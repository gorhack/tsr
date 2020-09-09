package events.tracked.tsr.event.type

import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface EventTypeRepository : PagingAndSortingRepository<EventType, Long> {
    //any additional
}
