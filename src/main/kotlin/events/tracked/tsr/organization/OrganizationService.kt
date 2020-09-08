package events.tracked.tsr.organization

import org.springframework.stereotype.Service

@Service
class OrganizationService(
    private val organizationRepository: OrganizationRepository
) {
    fun getAllOrgNames(): List<Organization> {
        return organizationRepository.findAll()
    }
}
