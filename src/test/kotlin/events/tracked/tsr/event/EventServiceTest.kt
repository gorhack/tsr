package events.tracked.tsr.event

import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDateTime

class EventServiceTest {
    private lateinit var subject: EventService
    private lateinit var mockEventRepository: EventRepository

    @BeforeEach
    fun setup() {
        mockEventRepository = mockk(relaxUnitFun = true)
        subject = EventService(mockEventRepository)
    }

    @Test
    fun `saveEvent returns EventDTO with id and audiatable filled out`() {
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
        verify {
            mockEventRepository.save(unsavedEvent)
        }
    }
}