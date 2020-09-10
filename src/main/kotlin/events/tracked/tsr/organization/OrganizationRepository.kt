package events.tracked.tsr.organization

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Page


@Repository
interface OrganizationRepository: JpaRepository<Organization, Long>  {
    fun findByOrganizationDisplayNameContainsIgnoreCase(searchParam: String, paging: Pageable): Page<Organization>
}