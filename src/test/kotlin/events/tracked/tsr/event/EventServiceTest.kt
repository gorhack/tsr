package events.tracked.tsr.event

import events.tracked.tsr.*
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserRepository
import events.tracked.tsr.user.UserRole
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.repository.findByIdOrNull
import java.time.OffsetDateTime

class EventServiceTest {
    private lateinit var subject: EventService
    private lateinit var mockEventRepository: EventRepository
    private lateinit var mockEventTypeRepository: EventTypeRepository
    private lateinit var mockTsrUserRepository: TsrUserRepository
    private lateinit var eventWithoutId: Event
    private lateinit var eventDTOWithoutId: EventDTO
    private lateinit var eventWithId: Event
    private lateinit var eventDTOWithId: EventDTO
    private lateinit var eventDTOWithIdAndDisplayNames: EventDTO

    @BeforeEach
    fun setup() {
        mockEventRepository = mockk(relaxUnitFun = true)
        mockEventTypeRepository = mockk(relaxUnitFun = true)
        mockTsrUserRepository = mockk(relaxUnitFun = true)
        subject = EventService(mockEventRepository, mockEventTypeRepository, mockTsrUserRepository)

        eventWithoutId = makeEventWithoutId()
        eventDTOWithoutId = makeEventDTOWithoutId()
        eventWithId = makeEventWithId()
        eventDTOWithId = makeEventDTOWithId()
        eventDTOWithIdAndDisplayNames = eventDTOWithId.copy(
            audit = eventDTOWithId.audit?.copy(
                createdByDisplayName = "user",
                lastModifiedByDisplayName = "user_2"
            )
        )
    }

    @Test
    fun `saveEvent returns EventDTO with id and auditable filled out`() {
        val unsavedEvent = eventWithoutId
        val unsavedEventDTO = eventDTOWithoutId
        val savedEvent = eventWithId
        val savedEventDTO = eventDTOWithId
        every { mockEventRepository.save(unsavedEvent) } returns savedEvent
        assertEquals(savedEventDTO, subject.saveEvent(unsavedEventDTO))
        verifySequence {
            mockEventRepository.save(unsavedEvent)
        }
    }

    @Test
    fun `getAllEvents returns PageDTO of EventDTOs list of all events`() {
        val event2 = Event(
            eventId = 2L,
            eventName = "red",
            organization = "company",
            eventType = EventType(1, "rock", "rocks are fun", 1),
            startDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
            endDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
            lastModifiedBy = "user",
            lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
            createdBy = "another user",
            createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
        )
        val event2DTO = EventDTO(
            eventId = 2L,
            eventName = "red",
            organization = "company",
            eventType = EventType(1L, "rock", "rocks are fun", 1),
            startDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
            endDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
            audit = AuditDTO(lastModifiedBy = "user",
                lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
                createdBy = "another user",
                createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
            )
        )
        val expectedPageDTO = PageDTO(
            items = listOf(eventDTOWithId, event2DTO),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )

        val paging: Pageable = PageRequest.of(0, 10, Sort.by("createdDate"))
        every { mockEventRepository.findAll(paging) } returns PageImpl(listOf(eventWithId, event2), paging, 2)
        assertEquals(expectedPageDTO, subject.getAllEvents(0, 10, Sort.by("createdDate")))
        verifySequence {
            mockEventRepository.findAll(paging)
        }
    }

    @Test
    fun `getAllEventsEndingAfterToday returns PageDTO of EventDTOs list of all events that end after today`() {
        val expectedPageDTO = PageDTO(
            items = listOf(eventDTOWithId),
            totalPages = 1,
            totalResults = 1,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )

        val paging: Pageable = PageRequest.of(0, 10, Sort.by("startDate"))
        every { mockEventRepository.findByEndDateGreaterThanEqual(any(), paging) } returns PageImpl(listOf(eventWithId), paging, 1)
        assertEquals(expectedPageDTO, subject.getAllEventsEndingAfterToday(0, 10, Sort.by("startDate")))
        verifySequence {
            mockEventRepository.findByEndDateGreaterThanEqual(any(), paging)
        }
    }

    @Test
    fun `getEventTypes returns list of all event_types`() {
        val eventType1 = EventType(1L, "first", "first event", 1)
        val eventType2 = EventType(2L, "second", "second event", 2)

        every { mockEventTypeRepository.findAll() } returns listOf(eventType1, eventType2)

        assertThat(subject.getAllEventTypes()).containsExactlyInAnyOrderElementsOf(listOf(eventType2, eventType1))
        verifySequence {
            mockEventTypeRepository.findAll()
        }
    }

    @Test
    fun `getEventById returns an event with display names`() {
        every { mockEventRepository.findByIdOrNull(1L) } returns eventWithId
        every { mockTsrUserRepository.findByUserId("1234") } returns TsrUser(1L, "1234", "user", UserRole.USER)
        every { mockTsrUserRepository.findByUserId("6789") } returns TsrUser(2L, "6789", "user_2", UserRole.USER)
        assertEquals(eventDTOWithIdAndDisplayNames, subject.getEventById(1))
        verifySequence {
            mockEventRepository.findByIdOrNull(1L)
            mockTsrUserRepository.findByUserId("1234")
            mockTsrUserRepository.findByUserId("6789")
        }
    }

    @Test
    fun `getEventsByUserId returns list of events by that user`() {
        every { mockEventRepository.findAllByCreatedBy("1234") } returns listOf(eventWithId)
        assertThat(subject.getEventsByUserId("1234")).containsExactlyInAnyOrderElementsOf(listOf(eventDTOWithId))
    }
}