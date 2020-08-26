package events.tracked.tsr.event

import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions
import java.time.LocalDateTime

internal class EventControllerTest {
    private lateinit var subject: EventController
    private lateinit var mockEventService: EventService

    @Before
    fun setup() {
        mockEventService = mockk(relaxUnitFun = true)
        subject = EventController(mockEventService)
    }

    @Test
    fun `saves event`() {
        val unsavedEventDTO = EventDTO(
                eventName = "blue",
                organization = "company",
                eventType = EventType(1, "rock", "rocks are fun", 1),
                startDate = LocalDateTime.parse("1970-01-01T00:00:01"),
                endDate = LocalDateTime.parse("1970-01-02T00:00:01")
        )
        val savedEventDTO = unsavedEventDTO.copy(
                eventId = 1
        )
        every { mockEventService.saveEvent(unsavedEventDTO) } returns savedEventDTO
        Assertions.assertEquals(savedEventDTO, subject.saveEvent(unsavedEventDTO))
        verifySequence {
            mockEventService.saveEvent(unsavedEventDTO)
        }
    }

    @Test
    fun `returns all event types`() {
        val eventType1 = EventType(1, "first", "first event", 1)
        val eventType2 = EventType(2, "second", "second event", 2)

        every { mockEventService.getAllEventTypes() } returns listOf(eventType1, eventType2)

        assertThat(subject.allEventTypes()).containsExactlyInAnyOrderElementsOf(listOf(eventType2, eventType1))
        verifySequence {
            mockEventService.getAllEventTypes()
        }
    }
}