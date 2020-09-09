package events.tracked.tsr.organization

import events.tracked.tsr.PageDTO
import events.tracked.tsr.event.EventDTO
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
    private lateinit var organizationWithId2: Organization
    private lateinit var expectedPageDTO: PageDTO<Organization>

    @Before
    fun setup() {
        mockOrganizationService = mockk(relaxUnitFun = true)
        subject = OrganizationController(mockOrganizationService)
        organizationWithId = Organization(1L, "first org", "first org", 1)
        organizationWithId2 = Organization(2L, "org two", "org two name", 2)
    }

    @Test
    fun `returns all org names`() {
        every { mockOrganizationService.getAllOrgNames() } returns listOf(organizationWithId, organizationWithId2)

        Assertions.assertThat(subject.allOrgNames()).containsExactlyInAnyOrderElementsOf(listOf(organizationWithId, organizationWithId2))
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

    @Test
    fun `returns Page DTO of org names with search feature`() {
        expectedPageDTO = PageDTO(
                items = listOf(organizationWithId, organizationWithId2),
                totalPages = 1,
                totalResults = 2,
                pageNumber = 0,
                isFirst = true,
                isLast = true,
                pageSize = 10
        )

        every {mockOrganizationService.getOrganizationsContaining("org", 0, 10) } returns expectedPageDTO
        assertEquals(expectedPageDTO, subject.getOrganizationsContaining("org", 0 ,10))
        verifySequence {
            mockOrganizationService.getOrganizationsContaining("org",0,10)
        }
    }
}