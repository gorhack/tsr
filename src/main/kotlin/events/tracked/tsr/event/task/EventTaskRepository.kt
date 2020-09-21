package events.tracked.tsr.event.task

import events.tracked.tsr.event.Event
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EventTaskRepository : JpaRepository<EventTask, Long> {
    fun findAllByEventId(event: Event): List<EventTask>
}