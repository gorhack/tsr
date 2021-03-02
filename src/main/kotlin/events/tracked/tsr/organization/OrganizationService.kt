package events.tracked.tsr.organization

import events.tracked.tsr.PageDTO
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service

@Service
class OrganizationService(
    private val organizationRepository: OrganizationRepository
) {
    fun getAllOrgNames(page: Int, size: Int, sortBy: Sort): PageDTO<OrganizationDTO> {
        val paging: Pageable = PageRequest.of(page, size, sortBy)
        val orgPage = organizationRepository.findAll(paging)
        return if (orgPage.hasContent()) {
            PageDTO(orgPage.map { e -> e.toOrganizationDTO() })
        } else {
            PageDTO()
        }
    }

    fun saveOrganization(organizationDTO: OrganizationDTO): OrganizationDTO {
        val orgCount = organizationRepository.count()
        val createdOrganization = organizationRepository.save(organizationDTO.toOrganization().copy(sortOrder = (orgCount + 1).toInt()))
        return OrganizationDTO(createdOrganization)
    }

    fun getOrganizationsContains(searchTerm: String, page: Int, size: Int, sortBy: Sort): PageDTO<OrganizationDTO> {
        val paging: Pageable = PageRequest.of(page, size, sortBy)
        val pagedOrganizationResults = organizationRepository.findByOrganizationDisplayNameContainsIgnoreCase(searchTerm, paging)

        return if (pagedOrganizationResults.hasContent()) {
            PageDTO(pagedOrganizationResults.map { e -> e.toOrganizationDTO() })
        } else {
            return PageDTO()
        }
    }
}
