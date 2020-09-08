package events.tracked.tsr.organization

import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.assertj.core.api.Assertions
import org.junit.Test
import org.junit.Before

internal class OrganizationControllerTest {
    private lateinit var subject: OrganizationController
    private lateinit var mockOrganizationService: OrganizationService

    @Before
    fun setup() {
        mockOrganizationService = mockk(relaxUnitFun = true)
        subject = OrganizationController(mockOrganizationService)
    }

    @Test
    fun `returns all org names`() {
        val orgName1 = Organization(1L, "org one", "org one name", 1)
        val orgName2 = Organization(2L, "org two", "org two name", 2)

        every { mockOrganizationService.getAllOrgNames() } returns listOf(orgName1, orgName2)

        Assertions.assertThat(subject.allOrgNames()).containsExactlyInAnyOrderElementsOf(listOf(orgName1, orgName2))
        verifySequence {
            mockOrganizationService.getAllOrgNames()
        }
    }
}