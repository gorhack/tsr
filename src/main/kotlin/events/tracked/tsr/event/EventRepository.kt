package events.tracked.tsr.event

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface EventRepository : JpaRepository<Event, Long>, PagingAndSortingRepository<Event, Long> {
    fun findAllByCreatedBy(userId: String): List<Event>
}