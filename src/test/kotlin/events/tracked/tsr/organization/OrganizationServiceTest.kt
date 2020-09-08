package events.tracked.tsr.organization

import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
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
}