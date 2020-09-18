package events.tracked.tsr.event.task

import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface EventTaskCategoryRepository : PagingAndSortingRepository<EventTaskCategory, Long>