package events.tracked.tsr.event

import events.tracked.tsr.*
import events.tracked.tsr.event.type.EventType
import events.tracked.tsr.organization.Organization
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserRepository
import events.tracked.tsr.user.UserRole
import io.mockk.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import java.time.OffsetDateTime

class EventServiceTest {
    private lateinit var subject: EventService
    private lateinit var mockEventRepository: EventRepository
    private lateinit var mockTsrUserRepository: TsrUserRepository
    private lateinit var mockApplicationEventPublisher: ApplicationEventPublisher

    private var capturedTsrEventSaveEvent = slot<NewTsrEventSaveEvent>()
    private var capturedTsrEventUpdateEvent = slot<UpdateTsrEventSaveEvent>()

    // test data
    private lateinit var eventWithoutId: Event
    private lateinit var eventDTOWithoutId: EventDTO
    private lateinit var eventWithId: Event
    private lateinit var eventWithId2: Event
    private lateinit var eventDTOWithId: EventDTO
    private lateinit var eventDTOWithId2: EventDTO
    private lateinit var eventDTOWithIdAndDisplayNames: EventDTO
    private lateinit var organizations: MutableList<Organization>
    private lateinit var expectedPageDTO: PageDTO<EventDTO>

    @BeforeEach
    fun setup() {
        mockEventRepository = mockk(relaxUnitFun = true)
        mockTsrUserRepository = mockk(relaxUnitFun = true)
        mockApplicationEventPublisher = mockk()
        subject = EventService(mockEventRepository, mockTsrUserRepository, mockApplicationEventPublisher)

        every {
            mockApplicationEventPublisher.publishEvent(capture(capturedTsrEventSaveEvent))
        } just Runs

        every {
            mockApplicationEventPublisher.publishEvent(capture(capturedTsrEventUpdateEvent))
        } just Runs

        eventWithoutId = makeEventWithoutId()
        eventDTOWithoutId = makeEventDTOWithoutId()

        eventWithId = makeEventWithId()
        eventWithId2 = makeEventWithId2()
        eventDTOWithId = makeEventDTOWithId()
        eventDTOWithId2 = makeEventDTOWithId2()

        eventDTOWithIdAndDisplayNames = eventDTOWithId.copy(
            audit = eventDTOWithId.audit?.copy(
                createdByDisplayName = "user",
                lastModifiedByDisplayName = "user_2"
            )
        )
        organizations = mutableListOf(makeOrganization1(), makeOrganization2())
        expectedPageDTO = PageDTO(
            items = listOf(eventDTOWithId, eventDTOWithId2),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )
    }

    @Test
    fun `saveEvent returns EventDTO with id and auditable filled out`() {
        val unsavedEvent = eventWithoutId
        val unsavedEventDTO = eventDTOWithoutId
        val savedEvent = eventWithId
        val savedEventDTO = eventDTOWithId
        every { mockEventRepository.saveAndFlush(unsavedEvent) } returns savedEvent
        assertEquals(savedEventDTO, subject.saveEvent(unsavedEventDTO))
        verifySequence {
            mockEventRepository.saveAndFlush(unsavedEvent)
        }
        assertEquals(savedEvent, capturedTsrEventSaveEvent.captured.event)
    }

    @Test
    fun `getActiveEvents returns PageDTO of EventDTOs list of all events that end after today`() {
        val paging: Pageable = PageRequest.of(0, 10, Sort.by("startDate"))
        every {
            mockEventRepository.findByEndDateGreaterThanEqual(any(), paging)
        } returns PageImpl(listOf(eventWithId, eventWithId2), paging, 2)
        assertEquals(expectedPageDTO, subject.getActiveEvents(0, 10, Sort.by("startDate")))
        verifySequence {
            mockEventRepository.findByEndDateGreaterThanEqual(any(), paging)
        }
    }

    @Test
    fun `getEventDTOById returns an event with display names`() {
        every { mockEventRepository.findByIdOrNull(1L) } returns eventWithId
        every {
            mockTsrUserRepository.findByUserId("1234")
        } returns TsrUser(1L, "1234", "user", UserRole.USER)
        every {
            mockTsrUserRepository.findByUserId("6789")
        } returns TsrUser(2L, "6789", "user_2", UserRole.USER)
        assertEquals(eventDTOWithIdAndDisplayNames, subject.getEventDTOById(1))
        verifySequence {
            mockEventRepository.findByIdOrNull(1L)
            mockTsrUserRepository.findByUserId("1234")
            mockTsrUserRepository.findByUserId("6789")
        }
    }

    @Test
    fun `getActiveEventsByUserId returns page of events created by a user`() {
        val paging: Pageable = PageRequest.of(0, 10, Sort.by("startDate"))
        every {
            mockEventRepository.findByCreatedByAndEndDateGreaterThanEqual("1234", any(), paging)
        } returns PageImpl(listOf(eventWithId, eventWithId2), paging, 2)
        assertEquals(
            expectedPageDTO,
            subject.getActiveEventsByUserId("1234", 0, 10, Sort.by("startDate"))
        )
    }

    @Test
    fun `getActiveEventsByOrganizations returns page of events that belong to that organization`() {
        val paging: Pageable = PageRequest.of(0, 10, Sort.by("startDate"))
        every {
            mockEventRepository.findByOrganizationsInAndEndDateGreaterThanEqual(organizations, any(), paging)
        } returns PageImpl(listOf(eventWithId, eventWithId2), paging, 2)
        assertEquals(
            expectedPageDTO,
            subject.getActiveEventsByOrganizationIds(organizations, 0, 10, Sort.by("startDate"))
        )
    }

    @Test
    fun `editEvent returns eventDTO with updated event details`() {
        val updatedEventDTO = eventDTOWithId.copy(
            audit = AuditDTO(
                lastModifiedBy = "9876",
                lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-09:00"),
                createdBy = "1234",
                createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
            )
        )
        val updatedEvent = Event(
            eventId = 1L,
            eventName = "blue",
            organizations = mutableListOf(makeOrganization1()),
            startDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
            endDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
            eventType = EventType(1, "rock", "rocks are fun", 1),
            lastModifiedBy = "9876",
            lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-09:00"),
            createdBy = "1234",
            createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
        )
        every { mockEventRepository.findByIdOrNull(1) } returns eventWithId
        every { mockEventRepository.saveAndFlush(updatedEvent) } returns updatedEvent
        assertEquals(updatedEventDTO, subject.updateEvent(eventDTOWithId))
        verifySequence {
            mockEventRepository.findByIdOrNull(1)
            mockEventRepository.saveAndFlush(eventWithId)
        }
        assertEquals(updatedEvent, capturedTsrEventUpdateEvent.captured.event)
    }
}