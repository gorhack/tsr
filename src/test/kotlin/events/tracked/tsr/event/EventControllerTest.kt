package events.tracked.tsr.event

import events.tracked.tsr.*
import events.tracked.tsr.organization.Organization
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserService
import events.tracked.tsr.user.UserRole
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import java.time.OffsetDateTime

internal class EventControllerTest {
    private lateinit var subject: EventController
    private lateinit var mockEventService: EventService
    private lateinit var mockTsrUserService: TsrUserService
    private lateinit var oidcUser: OidcUser
    private lateinit var tsrUser: TsrUser
    private lateinit var organizations: MutableList<Organization>
    private lateinit var eventDTOWithoutId: EventDTO
    private lateinit var eventDTOWithId: EventDTO
    private lateinit var eventDTOWithId2: EventDTO
    private lateinit var expectedPageDTO: PageDTO<EventDTO>
    private lateinit var defaultSortBy: Sort
    private lateinit var eventDTOWithIdAndDisplayNames: EventDTO

    @Before
    fun setup() {
        mockEventService = mockk(relaxUnitFun = true)
        mockTsrUserService = mockk(relaxUnitFun = true)
        subject = EventController(mockEventService, mockTsrUserService)

        oidcUser = makeOidcUser(userId = "1234", userName = "user")
        organizations = mutableListOf(
            makeOrganization1(),
            makeOrganization2()
        )
        tsrUser = TsrUser(
            id = 1L,
            userId = "1234",
            username = "user",
            role = UserRole.USER,
            organizations = organizations
        )
        eventDTOWithoutId = makeEventDTOWithoutId()
        eventDTOWithId = makeEventDTOWithId()
        eventDTOWithId2 = makeEventDTOWithId2()
        expectedPageDTO = PageDTO(
            items = listOf(eventDTOWithId, eventDTOWithId2),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )
        eventDTOWithIdAndDisplayNames = eventDTOWithId.copy(
            audit = eventDTOWithId.audit?.copy(
                createdByDisplayName = "user",
                lastModifiedByDisplayName = "user_2"
            )
        )
        defaultSortBy = Sort.by("startDate").and(Sort.by("endDate"))
    }

    @Test
    fun `saves event`() {
        every { mockEventService.saveEvent(eventDTOWithoutId) } returns eventDTOWithId
        assertEquals(eventDTOWithId, subject.saveEvent(eventDTOWithoutId))
        verifySequence {
            mockEventService.saveEvent(eventDTOWithoutId)
        }
    }

    @Test
    fun `getActiveEvents returns page of events sorted by startDate then endDate that end after today`() {
        val expectedResponse: ResponseEntity<PageDTO<EventDTO>> = ResponseEntity(
            expectedPageDTO, HttpStatus.OK
        )

        every {
            mockEventService.getActiveEvents(0, 10, defaultSortBy)
        } returns expectedPageDTO

        assertEquals(expectedResponse, subject.getActiveEvents(0, 10, "startDate"))
        verifySequence {
            mockEventService.getActiveEvents(0, 10, defaultSortBy)
        }
    }

    @Test
    fun `getActiveEventsByUserId returns list of events created by a user`() {
        val expectedResponse: ResponseEntity<PageDTO<EventDTO>> = ResponseEntity(
            expectedPageDTO, HttpStatus.OK
        )

        every { mockTsrUserService.assertUserExistsAndReturnUser(oidcUser) } returns tsrUser
        every {
            mockEventService.getActiveEventsByUserId("1234", 0, 10, defaultSortBy)
        } returns expectedPageDTO

        assertEquals(expectedResponse, subject.getActiveEventsByUserId(oidcUser, 0, 10, "startDate"))
        verifySequence {
            mockTsrUserService.assertUserExistsAndReturnUser(oidcUser)
            mockEventService.getActiveEventsByUserId("1234", 0, 10, defaultSortBy)
        }
    }

    @Test
    fun `getEventById returns a page of current and future events by user id`() {
        every { mockEventService.getEventDTOById(1) } returns eventDTOWithId
        assertEquals(subject.getEventById(1), eventDTOWithId)
        verifySequence {
            mockEventService.getEventDTOById(1)
        }
    }

    @Test
    fun `getActiveEventsByOrganizationIds returns list of events in those orgs`() {
        val expectedResponse: ResponseEntity<PageDTO<EventDTO>> = ResponseEntity(
            expectedPageDTO, HttpStatus.OK
        )
        every {
            mockTsrUserService.assertUserExistsAndReturnUser(oidcUser)
        } returns tsrUser
        every {
            mockEventService.getActiveEventsByOrganizationIds(organizations, 0, 10, defaultSortBy)
        } returns expectedPageDTO

        assertEquals(
            expectedResponse,
            subject.getActiveEventsByOrganizationIds(oidcUser, 0, 10, "startDate")
        )
        verifySequence {
            mockTsrUserService.assertUserExistsAndReturnUser(oidcUser)
            mockEventService.getActiveEventsByOrganizationIds(organizations, 0, 10, defaultSortBy)
        }
    }

    @Test
    fun `edits already created event`() {
        val updatedEvent = eventDTOWithId.copy(
            audit = AuditDTO(
                lastModifiedBy = "9876",
                lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-09:00"),
                createdBy = "1234",
                createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
            )
        )
        every { mockEventService.updateEvent(eventDTOWithId) } returns updatedEvent
        assertEquals(updatedEvent, subject.updateEvent(eventDTOWithId))
        verifySequence { mockEventService.updateEvent(eventDTOWithId) }
    }
}