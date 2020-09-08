package events.tracked.tsr.organization

import org.springframework.stereotype.Service

@Service
class OrganizationService(
    private val organizationRepository: OrganizationRepository
) {
    fun getAllOrgNames(): List<Organization> {
        return organizationRepository.findAll()
    }
    fun saveOrganization(displayName: String): Organization {
        val orgCount = organizationRepository.count()
        val org = Organization(organizationName = displayName, organizationDisplayName = displayName, sortOrder = orgCount.toInt() +1 )
        return organizationRepository.save(org)
    }
}
