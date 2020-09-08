package events.tracked.tsr.organization

import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.jupiter.api.Assertions.assertEquals
import org.assertj.core.api.Assertions
import org.junit.Test
import org.junit.Before

internal class OrganizationControllerTest {
    private lateinit var subject: OrganizationController
    private lateinit var mockOrganizationService: OrganizationService
    private lateinit var organizationWithId: Organization

    @Before
    fun setup() {
        mockOrganizationService = mockk(relaxUnitFun = true)
        subject = OrganizationController(mockOrganizationService)
        organizationWithId = Organization(1L, "first org", "first org", 1)

    }

    @Test
    fun `returns all org names`() {
        val orgName2 = Organization(2L, "org two", "org two name", 2)

        every { mockOrganizationService.getAllOrgNames() } returns listOf(organizationWithId, orgName2)

        Assertions.assertThat(subject.allOrgNames()).containsExactlyInAnyOrderElementsOf(listOf(organizationWithId, orgName2))
        verifySequence {
            mockOrganizationService.getAllOrgNames()
        }
    }

    @Test
    fun `saves new organization`() {
        every { mockOrganizationService.saveOrganization("first org") } returns organizationWithId
        assertEquals(organizationWithId, subject.saveOrganization("first org"))
        verifySequence { mockOrganizationService.saveOrganization("first org") }
    }

}