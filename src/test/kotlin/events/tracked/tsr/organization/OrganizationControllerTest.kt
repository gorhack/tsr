package events.tracked.tsr.organization

import events.tracked.tsr.PageDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

internal class OrganizationControllerTest {
    private lateinit var subject: OrganizationController
    private lateinit var mockOrganizationService: OrganizationService
    private lateinit var organizationWithId: OrganizationDTO
    private lateinit var organizationWithId2: OrganizationDTO
    private lateinit var expectedPageDTO: PageDTO<OrganizationDTO>

    @Before
    fun setup() {
        mockOrganizationService = mockk(relaxUnitFun = true)
        subject = OrganizationController(mockOrganizationService)
        organizationWithId = OrganizationDTO(1L, "first org", "first org", 1)
        organizationWithId2 = OrganizationDTO(2L, "org two", "org two name", 2)
        expectedPageDTO = PageDTO(
            items = listOf(organizationWithId, organizationWithId2),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )
    }

    @Test
    fun `returns page of organizations`() {
        val expectedResponse: ResponseEntity<PageDTO<OrganizationDTO>> = ResponseEntity(
            expectedPageDTO, HttpStatus.OK
        )

        every { mockOrganizationService.getAllOrgNames(0,10,Sort.by("sortOrder")) } returns expectedPageDTO

        assertEquals(expectedResponse, subject.allOrgNames(0,10,"sortOrder"))
        verifySequence {
            mockOrganizationService.getAllOrgNames(0,10,Sort.by("sortOrder"))
        }
    }

    @Test
    fun `creates new organization`() {
        val expectedResponse: ResponseEntity<OrganizationDTO> = ResponseEntity(
            organizationWithId, HttpStatus.CREATED
        )

        every { mockOrganizationService.saveOrganization("first org") } returns organizationWithId
        assertEquals(expectedResponse, subject.saveOrganization("first org"))
        verifySequence { mockOrganizationService.saveOrganization("first org") }
    }

    @Test
    fun `without search terms, returns page of organizations`() {
        val expectedResponse: ResponseEntity<PageDTO<OrganizationDTO>> = ResponseEntity(
                expectedPageDTO, HttpStatus.OK
        )

        every { mockOrganizationService.getOrganizationsContains("event", 0, 10, Sort.by("sortOrder")) } returns expectedPageDTO

        assertEquals(expectedResponse, subject.getOrganizationsContains("event", 0, 10, "sortOrder"))
        verifySequence {
            mockOrganizationService.getOrganizationsContains("event", 0, 10, Sort.by("sortOrder"))
        }
    }

}
