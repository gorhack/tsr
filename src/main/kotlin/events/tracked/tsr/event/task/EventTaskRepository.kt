package events.tracked.tsr.event.task

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EventTaskRepository : JpaRepository<EventTask, Long> {
    fun findAllByEventEventId(eventId: Long): List<EventTask>
}