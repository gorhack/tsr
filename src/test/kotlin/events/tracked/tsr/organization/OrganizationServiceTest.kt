package events.tracked.tsr.organization

import events.tracked.tsr.PageDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.*

class OrganizationServiceTest {
    private lateinit var subject: OrganizationService
    private lateinit var mockOrganizationRepository: OrganizationRepository
    private lateinit var organization1: Organization
    private lateinit var organization2: Organization
    private lateinit var organization1DTO: OrganizationDTO
    private lateinit var organization2DTO: OrganizationDTO
    private lateinit var expectedPageDTO: PageDTO<OrganizationDTO>

    @BeforeEach
    fun setup() {
        mockOrganizationRepository = mockk(relaxUnitFun = true)
        subject = OrganizationService(mockOrganizationRepository)
        organization1 = Organization(1L, "org one", "org one name", 1)
        organization2 = Organization(2L, "org two", "org two name", 2)
        organization1DTO = OrganizationDTO(1L, "org one", "org one name", 1)
        organization2DTO = OrganizationDTO(2L, "org two", "org two name", 2)
        expectedPageDTO = PageDTO(
            items = listOf(organization1DTO, organization2DTO),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )
    }

    @Test
    fun `getOrgNames returns list of all org names`() {
        val paging: Pageable = PageRequest.of(0, 10, Sort.by("sortOrder"))

        every { mockOrganizationRepository.findAll(paging) } returns PageImpl(listOf(organization1, organization2), paging, 2)

        assertEquals(expectedPageDTO, subject.getAllOrgNames( 0, 10, Sort.by("sortOrder")))
        verifySequence {
            mockOrganizationRepository.findAll(paging)
        }
    }

    @Test
    fun `saveOrganization returns OrganizationDTO with ID and auditable filled out`() {
        val organizationToCreate = Organization(organizationName = "org three", organizationDisplayName = "org three", sortOrder = 3)
        val expectedOrganization = organizationToCreate.copy(organizationId = 3L)
        val organizationToCreateDTO = organizationToCreate.toOrganizationDTO()
        val expectedOrganizationDTO = expectedOrganization.toOrganizationDTO()

        every { mockOrganizationRepository.count() } returns 2
        every { mockOrganizationRepository.save(organizationToCreate)} returns expectedOrganization
        assertEquals(expectedOrganizationDTO, subject.saveOrganization(organizationToCreateDTO))
        verifySequence {
            mockOrganizationRepository.count()
            mockOrganizationRepository.save(organizationToCreate)
        }

    }

    @Test
    fun `getOrganizationContaining returns PageDTO of organizations`() {
        val paging: Pageable = PageRequest.of(0, 10, Sort.by( "sortOrder"))

        every { mockOrganizationRepository.findByOrganizationDisplayNameContainsIgnoreCase("org", paging)
        } returns PageImpl(listOf(organization1, organization2), paging, 2)

        assertEquals(expectedPageDTO, subject.getOrganizationsContains("org", 0, 10, Sort.by("sortOrder")))
        verifySequence { mockOrganizationRepository.findByOrganizationDisplayNameContainsIgnoreCase("org", paging) }
    }
}