package events.tracked.tsr.organization

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OrganizationRepository: JpaRepository<Organization, Long>  {
    //any additional
}