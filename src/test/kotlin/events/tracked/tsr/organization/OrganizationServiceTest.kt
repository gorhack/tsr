package events.tracked.tsr.organization

import events.tracked.tsr.PageDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.jupiter.api.Assertions.assertEquals
import org.assertj.core.api.Assertions
import org.junit.Before
import org.junit.Test
import org.springframework.data.domain.*

class OrganizationServiceTest {
    private lateinit var subject: OrganizationService
    private lateinit var mockOrganizationRepository: OrganizationRepository
    private lateinit var organization1: Organization
    private lateinit var organization2: Organization
    private lateinit var expectedPageDTO: PageDTO<Organization>

    @Before
    fun setup() {
        mockOrganizationRepository = mockk(relaxUnitFun = true)
        subject = OrganizationService(mockOrganizationRepository)
        organization1 = Organization(1L, "org one", "org one name", 1)
        organization2 = Organization(2L, "org two", "org two name", 2)
    }

    @Test
    fun `getOrgNames returns list of all org_names`() {
        every { mockOrganizationRepository.findAll() } returns listOf(organization1, organization2)

        Assertions.assertThat(subject.getAllOrgNames()).containsExactlyInAnyOrderElementsOf(listOf(organization1, organization2))
        verifySequence {
            mockOrganizationRepository.findAll()
        }
    }

    @Test
    fun `saveOrganization returns an organization with ID`() {
        val organizationWithoutId = Organization(organizationName = "second org", organizationDisplayName = "second org", sortOrder = 2)
        val organizationWithId = organizationWithoutId.copy(organizationId = 2L)

        every { mockOrganizationRepository.count() } returns 1
        every { mockOrganizationRepository.save(organizationWithoutId)} returns organizationWithId
        assertEquals(organizationWithId, subject.saveOrganization("second org"))
        verifySequence {
            mockOrganizationRepository.count()
            mockOrganizationRepository.save(organizationWithoutId)
        }

    }

    @Test
    fun `getOrganizationContaining returns PageDTO of organizations`() {
        val paging: Pageable = PageRequest.of(0, 10, Sort.by( "sortOrder"))
        expectedPageDTO = PageDTO(
                items = listOf(organization1, organization2),
                totalPages = 1,
                totalResults = 2,
                pageNumber = 0,
                isFirst = true,
                isLast = true,
                pageSize = 10
        )

        every { mockOrganizationRepository.findByOrganizationDisplayNameContainsIgnoreCase("org", paging)
        } returns PageImpl(listOf(organization1, organization2), paging, 2)

        assertEquals(expectedPageDTO, subject.getOrganizationsContains("org", 0, 10, Sort.by("sortOrder")))
        verifySequence { mockOrganizationRepository.findByOrganizationDisplayNameContainsIgnoreCase("org", paging) }
    }
}