package events.tracked.tsr.event

import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.Before
import org.junit.Test
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
            eventType = EventType(1L, "rock", "rocks are fun", 1),
            startDate = LocalDateTime.parse("1970-01-01T00:00:01"),
            endDate = LocalDateTime.parse("1970-01-02T00:00:01")
        )
        val savedEventDTO = unsavedEventDTO.copy(
            eventId = 1L
        )
        every { mockEventService.saveEvent(unsavedEventDTO) } returns savedEventDTO
        assertEquals(savedEventDTO, subject.saveEvent(unsavedEventDTO))
        verifySequence {
            mockEventService.saveEvent(unsavedEventDTO)
        }
    }

    @Test
    fun `returns all event types`() {
        val eventType1 = EventType(1L, "first", "first event", 1)
        val eventType2 = EventType(2L, "second", "second event", 2)

        every { mockEventService.getAllEventTypes() } returns listOf(eventType1, eventType2)

        assertThat(subject.allEventTypes()).containsExactlyInAnyOrderElementsOf(listOf(eventType2, eventType1))
        verifySequence {
            mockEventService.getAllEventTypes()
        }
    }

    @Test
    fun `returns all events`() {
        val event = EventDTO(
            eventId = 1L,
            eventName = "first",
            organization = "org1",
            startDate = LocalDateTime.parse("1975-01-01T00:00:01"),
            endDate = LocalDateTime.parse("1975-01-01T00:00:01"),
            eventType = EventType(1L, "first", "first event", 1),
            createdDate = LocalDateTime.parse("1974-01-01T00:00:01"),
            lastModifiedDate = LocalDateTime.parse("1974-01-01T00:00:01")
        )
        val event2 = event.copy(
            eventId = 2L,
            eventName = "second"
        )

        every { mockEventService.getAllEvents() } returns listOf(event, event2)

        assertThat(subject.getAllEvents()).containsExactlyInAnyOrderElementsOf(listOf(event, event2))
        verifySequence {
            mockEventService.getAllEvents()
        }
    }

    @Test
    fun `getEventById returns an event`() {
        val eventDTO = EventDTO(
            eventId = 2L,
            organization = "orgggg",
            eventName = "red",
            eventType = EventType(1, "rock", "rocks are fun", 1),
            startDate = LocalDateTime.parse("1970-01-01T00:00:01"),
            endDate = LocalDateTime.parse("1970-01-02T00:00:01")
        )
        every { mockEventService.getEventById(2) } returns eventDTO
        assertEquals(subject.getEventById(2), eventDTO)
        verifySequence { mockEventService.getEventById(2) }
    }

    @Test
    fun `getEventsByUserId returns list of events created by a user`() {
        val userEvent = EventDTO(
            eventId = 1L,
            eventName = "first",
            organization = "org1",
            startDate = LocalDateTime.parse("1975-01-01T00:00:01"),
            endDate = LocalDateTime.parse("1975-01-01T00:00:01"),
            createdBy = "123"
        )
        every { mockEventService.getEventsByUserId("123") } returns listOf(userEvent)

        assertThat(subject.getEventsByUserId("123")).containsExactlyInAnyOrderElementsOf(listOf(userEvent))
        verifySequence {
            mockEventService.getEventsByUserId("123")
        }
    }
}