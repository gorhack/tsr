package events.tracked.tsr.event

import events.tracked.tsr.*
import events.tracked.tsr.event.type.EventType
import events.tracked.tsr.organization.Organization
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserService
import events.tracked.tsr.user.UserRole
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
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
    private lateinit var organizations: Set<Organization>
    private lateinit var eventDTOWithoutId: EventDTO
    private lateinit var eventDTOWithId: EventDTO
    private lateinit var eventDTOWithId2: EventDTO
    private lateinit var eventDTOWithNameTooLong: EventDTO
    private lateinit var expectedPageDTO: PageDTO<EventDTO>
    private lateinit var defaultSortBy: Sort
    private lateinit var eventDTOWithIdAndDisplayNames: EventDTO

    @BeforeEach
    fun setup() {
        mockEventService = mockk(relaxUnitFun = true)
        mockTsrUserService = mockk(relaxUnitFun = true)
        subject = EventController(mockEventService, mockTsrUserService)

        oidcUser = makeOidcUser(userId = "1234", userName = "user")
        organizations = hashSetOf(
            makeOrganization1(),
            makeOrganization2()
        )
        tsrUser = TsrUser(
            tsrUserId = 1L,
            userId = "1234",
            username = "user",
            role = UserRole.USER,
            organizations = organizations
        )
        eventDTOWithoutId = makeEventDTOWithoutId()
        eventDTOWithId = makeEventDTOWithId()
        eventDTOWithId2 = makeEventDTOWithId2()
        eventDTOWithNameTooLong = makeEventDTOWithNameTooLong()
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
    fun `returns HTTP 400 for invalid event name`() {
        assertThrows<NameTooLongException> {
            subject.saveEvent(eventDTOWithNameTooLong)
        }
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
        val eventName = "updated name"
        val startDate = OffsetDateTime.parse("2020-01-02T00:00:01-09:00")
        val endDate = OffsetDateTime.parse("2020-01-03T00:00:01-09:00")
        val eventType = EventType(11L, "some other thing", "some other thing", 50)
        val eventDTOToUpdate = EventDTO(
            eventId = 1L,
            eventName = eventName,
            organizations = hashSetOf(makeOrganizationDTO2()),
            startDate = startDate,
            endDate = endDate,
            eventType = eventType
        )
        val updatedEventDTO = EventDTO(
            eventId = 1L,
            eventName = eventName,
            organizations = hashSetOf(makeOrganizationDTO2()),
            startDate = startDate,
            endDate = endDate,
            eventType = eventType,
            audit = AuditDTO(
                lastModifiedBy = "9876",
                lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-09:00"),
                createdBy = "1234",
                createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
            )
        )
        val updatedEvent = Event(
            eventId = 1L,
            eventName = eventName,
            organizations = hashSetOf(makeOrganization2()),
            startDate = startDate,
            endDate = endDate,
            eventType = eventType,
            lastModifiedBy = "9876",
            lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-09:00"),
            createdBy = "1234",
            createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
        )
        every { mockEventService.updateEvent(eventDTOToUpdate) } returns updatedEvent
        assertEquals(updatedEventDTO, subject.updateEvent(eventDTOToUpdate))
        verifySequence { mockEventService.updateEvent(eventDTOToUpdate) }
    }
}