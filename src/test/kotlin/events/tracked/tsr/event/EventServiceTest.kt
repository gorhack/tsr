package events.tracked.tsr.event

import events.tracked.tsr.makeEventDTOWithId
import events.tracked.tsr.makeEventDTOWithoutId
import events.tracked.tsr.makeEventWithId
import events.tracked.tsr.makeEventWithoutId
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserRepository
import events.tracked.tsr.user.UserRole
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
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
    fun `getAllEvents returns EventDTO list of all events`() {
        val event2 = Event(
            eventId = 2L,
            eventName = "blue",
            organization = "company",
            eventType = EventType(1, "rock", "rocks are fun", 1),
            startDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
            endDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
            lastModifiedBy = "user",
            lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
            createdBy = "another user",
            createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
        )
        val event2DTO = EventDTO(
            eventId = 2L,
            eventName = "blue",
            organization = "company",
            eventType = EventType(1L, "rock", "rocks are fun", 1),
            startDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
            endDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
            audit = AuditDTO(lastModifiedBy = "user",
                lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
                createdBy = "another user",
                createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
            )
        )

        every { mockEventRepository.findAll() } returns listOf(eventWithId, event2)
        assertThat(subject.getAllEvents()).containsExactlyInAnyOrderElementsOf(listOf(event2DTO, eventDTOWithId))
        verifySequence {
            mockEventRepository.findAll()
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