package events.tracked.tsr.organization

import events.tracked.tsr.PageDTO
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
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
    fun getOrganizationsContaining(searchParam: String, page: Int, size: Int): PageDTO<Organization> {
        val paging: Pageable = PageRequest.of(page, size)
        val pagedOrganizationResults: Page<Organization> = organizationRepository.findByOrganizationDisplayNameContaining(searchParam, paging)

        return if (pagedOrganizationResults.hasContent()) {
            PageDTO(pagedOrganizationResults)
        } else {
            return PageDTO()
        }
    }
}
