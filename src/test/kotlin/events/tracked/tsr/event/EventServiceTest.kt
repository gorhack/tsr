package events.tracked.tsr.event

import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDateTime

class EventServiceTest {
    private lateinit var subject: EventService
    private lateinit var mockEventRepository: EventRepository
    private lateinit var mockEventTypeRepository: EventTypeRepository

    @BeforeEach
    fun setup() {
        mockEventRepository = mockk(relaxUnitFun = true)
        mockEventTypeRepository = mockk(relaxUnitFun = true)
        subject = EventService(mockEventRepository, mockEventTypeRepository)
    }

    @Test
    fun `saveEvent returns EventDTO with id and auditable filled out`() {
        val unsavedEvent = Event(
                eventName = "blue",
                organization = "company",
                eventType = EventType(1, "rock", "rocks are fun", 1),
                startDate = LocalDateTime.parse("1970-01-01T00:00:01"),
                endDate = LocalDateTime.parse("1970-01-02T00:00:01")
        )
        val unsavedEventDTO = EventDTO(
                eventName = "blue",
                organization = "company",
                eventType = EventType(1, "rock", "rocks are fun", 1),
                startDate = LocalDateTime.parse("1970-01-01T00:00:01"),
                endDate = LocalDateTime.parse("1970-01-02T00:00:01")
        )
        val savedEvent = unsavedEvent.copy(
                eventId = 1
        )
        val savedEventDTO = unsavedEventDTO.copy(
                eventId = 1
        )
        every { mockEventRepository.save(unsavedEvent) } returns savedEvent
        assertEquals(savedEventDTO, subject.saveEvent(unsavedEventDTO))
        verifySequence {
            mockEventRepository.save(unsavedEvent)
        }
    }

    @Test
    fun `getEventTypes returns list of all event_types`() {
        val eventType1 = EventType(1, "first", "first event", 1)
        val eventType2 = EventType(2, "second", "second event", 2)

        every { mockEventTypeRepository.findAll() } returns listOf(eventType1, eventType2)

        assertThat(subject.getAllEventTypes()).containsExactlyInAnyOrderElementsOf(listOf(eventType2, eventType1))
        verifySequence {
            mockEventTypeRepository.findAll()
        }
    }
}