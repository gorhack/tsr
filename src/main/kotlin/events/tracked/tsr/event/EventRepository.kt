package events.tracked.tsr.event

import events.tracked.tsr.organization.Organization
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime

@Repository
interface EventRepository : JpaRepository<Event, Long>, PagingAndSortingRepository<Event, Long> {
    fun findByEndDateGreaterThanEqual(date: OffsetDateTime, paging: Pageable): Page<Event>
    fun findByCreatedByAndEndDateGreaterThanEqual(userId: String, date: OffsetDateTime, paging: Pageable): Page<Event>
    fun findByOrganizationsInAndEndDateGreaterThanEqual(organizations: Set<Organization>, endDate: OffsetDateTime, pageable: Pageable): Page<Event>
}