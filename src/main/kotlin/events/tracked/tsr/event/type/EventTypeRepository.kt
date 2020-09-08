package events.tracked.tsr.event.type

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EventTypeRepository : JpaRepository<EventType, Long> {
    // any additional
}
