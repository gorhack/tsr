package events.tracked.tsr.event.task

import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface EventTaskRepository : PagingAndSortingRepository<EventTask, Long>