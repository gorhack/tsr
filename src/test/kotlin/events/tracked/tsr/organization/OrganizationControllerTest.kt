package events.tracked.tsr.organization

import events.tracked.tsr.PageDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.assertj.core.api.Assertions
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

internal class OrganizationControllerTest {
    private lateinit var subject: OrganizationController
    private lateinit var mockOrganizationService: OrganizationService
    private lateinit var organizationWithId: Organization
    private lateinit var organizationWithId2: Organization

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
        val expectedResponse: ResponseEntity<Organization> = ResponseEntity(
            organizationWithId, HttpStatus.CREATED
        )

        every { mockOrganizationService.saveOrganization("first org") } returns organizationWithId
        assertEquals(expectedResponse, subject.saveOrganization("first org"))
        verifySequence { mockOrganizationService.saveOrganization("first org") }
    }

    @Test
    fun `without search terms, returns page of organizations`() {
        val expectedPageDTO = PageDTO(
                items = listOf(organizationWithId, organizationWithId2),
                totalPages = 1,
                totalResults = 2,
                pageNumber = 0,
                isFirst = true,
                isLast = true,
                pageSize = 10
        )
        val expectedResponse: ResponseEntity<PageDTO<Organization>> = ResponseEntity(
                expectedPageDTO, HttpStatus.OK
        )

        every { mockOrganizationService.getOrganizationsContains("event", 0, 10, Sort.by("sortOrder")) } returns expectedPageDTO

        assertEquals(expectedResponse, subject.getOrganizationsContains("event", 0, 10, "sortOrder"))
        verifySequence {
            mockOrganizationService.getOrganizationsContains("event", 0, 10, Sort.by("sortOrder"))
        }
    }

}
