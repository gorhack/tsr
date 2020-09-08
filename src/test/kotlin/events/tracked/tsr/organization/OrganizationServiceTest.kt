package events.tracked.tsr.organization

import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.jupiter.api.Assertions.assertEquals
import org.assertj.core.api.Assertions
import org.junit.Before
import org.junit.Test

class OrganizationServiceTest {
    private lateinit var subject: OrganizationService
    private lateinit var mockOrganizationRepository: OrganizationRepository

    @Before
    fun setup() {
        mockOrganizationRepository = mockk(relaxUnitFun = true)
        subject = OrganizationService(mockOrganizationRepository)
    }

    @Test
    fun `getOrgNames returns list of all org_names`() {
        val orgName1 = Organization(1L, "org one", "org one name", 1)
        val orgName2 = Organization(2L, "org two", "org two name", 2)

        every { mockOrganizationRepository.findAll() } returns listOf(orgName1, orgName2)

        Assertions.assertThat(subject.getAllOrgNames()).containsExactlyInAnyOrderElementsOf(listOf(orgName1, orgName2))
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
}