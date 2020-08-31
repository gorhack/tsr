package events.tracked.tsr.event

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EventRepository : JpaRepository<Event, Long> {
    fun findAllByCreatedBy(userId: String): List<Event>
}