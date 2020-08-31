package events.tracked.tsr.event

import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull
import java.time.LocalDateTime

class EventServiceTest {
    private lateinit var subject: EventService
    private lateinit var mockEventRepository: EventRepository
    private lateinit var mockEventTypeRepository: EventTypeRepository
    private lateinit var eventWithoutId: Event
    private lateinit var eventDTOWithoutId: EventDTO
    private lateinit var eventWithId: Event
    private lateinit var eventDTOWithId: EventDTO

    @BeforeEach
    fun setup() {
        mockEventRepository = mockk(relaxUnitFun = true)
        mockEventTypeRepository = mockk(relaxUnitFun = true)
        subject = EventService(mockEventRepository, mockEventTypeRepository)

        eventWithoutId = Event(
            eventName = "blue",
            organization = "company",
            eventType = EventType(1, "rock", "rocks are fun", 1),
            startDate = LocalDateTime.parse("1970-01-01T00:00:01"),
            endDate = LocalDateTime.parse("1970-01-02T00:00:01")
        )

        eventDTOWithoutId = EventDTO(
            eventName = "blue",
            organization = "company",
            eventType = EventType(1, "rock", "rocks are fun", 1),
            startDate = LocalDateTime.parse("1970-01-01T00:00:01"),
            endDate = LocalDateTime.parse("1970-01-02T00:00:01")
        )

        eventWithId = Event(
            eventId = 1L,
            eventName = "blue",
            organization = "company",
            startDate = LocalDateTime.parse("1970-01-01T00:00:01"),
            endDate = LocalDateTime.parse("1970-01-02T00:00:01"),
            eventType = EventType(1, "rock", "rocks are fun", 1),
            lastModifiedBy = "1234",
            lastModifiedDate = LocalDateTime.parse("1970-01-02T00:00:01"),
            createdBy = "6789",
            createdDate = LocalDateTime.parse("1970-01-02T00:00:01")
        )

        eventDTOWithId = EventDTO(
            eventId = 1L,
            eventName = "blue",
            organization = "company",
            startDate = LocalDateTime.parse("1970-01-01T00:00:01"),
            endDate = LocalDateTime.parse("1970-01-02T00:00:01"),
            eventType = EventType(1, "rock", "rocks are fun", 1),
            lastModifiedBy = "1234",
            lastModifiedDate = LocalDateTime.parse("1970-01-02T00:00:01"),
            createdBy = "6789",
            createdDate = LocalDateTime.parse("1970-01-02T00:00:01")
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
            eventId = 1L,
            eventName = "blue",
            organization = "company",
            eventType = EventType(1, "rock", "rocks are fun", 1),
            startDate = LocalDateTime.parse("1970-01-01T00:00:01"),
            endDate = LocalDateTime.parse("1970-01-02T00:00:01"),
            lastModifiedBy = "user",
            lastModifiedDate = LocalDateTime.parse("1970-01-02T00:00:01"),
            createdBy = "another user",
            createdDate = LocalDateTime.parse("1970-01-02T00:00:01")
        )
        val event2DTO = EventDTO(
            eventId = 1L,
            eventName = "blue",
            organization = "company",
            eventType = EventType(1, "rock", "rocks are fun", 1),
            startDate = LocalDateTime.parse("1970-01-01T00:00:01"),
            endDate = LocalDateTime.parse("1970-01-02T00:00:01"),
            lastModifiedBy = "user",
            lastModifiedDate = LocalDateTime.parse("1970-01-02T00:00:01"),
            createdBy = "another user",
            createdDate = LocalDateTime.parse("1970-01-02T00:00:01")
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
    fun `getEventById returns an event`() {
        every { mockEventRepository.findByIdOrNull(1L) } returns eventWithId
        assertEquals(eventDTOWithId, subject.getEventById(1))
    }

    @Test
    fun `getEventsByUserId returns list of events by that user`() {
        every { mockEventRepository.findAllByCreatedBy("1234") } returns listOf(eventWithId)
        assertThat(subject.getEventsByUserId("1234")).containsExactlyInAnyOrderElementsOf(listOf(eventDTOWithId))
    }
}