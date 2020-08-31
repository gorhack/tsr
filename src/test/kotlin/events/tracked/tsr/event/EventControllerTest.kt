package events.tracked.tsr.event

import events.tracked.tsr.makeEventDTOWithId
import events.tracked.tsr.makeEventDTOWithoutId
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.Before
import org.junit.Test

internal class EventControllerTest {
    private lateinit var subject: EventController
    private lateinit var mockEventService: EventService
    private lateinit var eventDTOWithoutId: EventDTO
    private lateinit var eventDTOWithId: EventDTO
    private lateinit var eventDTOWithIdAndDisplayNames: EventDTO

    @Before
    fun setup() {
        mockEventService = mockk(relaxUnitFun = true)
        subject = EventController(mockEventService)

        eventDTOWithoutId = makeEventDTOWithoutId()
        eventDTOWithId = makeEventDTOWithId()
        eventDTOWithIdAndDisplayNames = eventDTOWithId.copy(
            audit = eventDTOWithId.audit?.copy(
                createdByDisplayName = "user",
                lastModifiedByDisplayName = "user_2"
            )
        )
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
        val event2 = eventDTOWithId.copy(
            eventId = 2L,
            eventName = "second"
        )

        every { mockEventService.getAllEvents() } returns listOf(eventDTOWithId, event2)

        assertThat(subject.getAllEvents()).containsExactlyInAnyOrderElementsOf(listOf(eventDTOWithId, event2))
        verifySequence {
            mockEventService.getAllEvents()
        }
    }

    @Test
    fun `getEventById returns an event`() {
        every { mockEventService.getEventById(1) } returns eventDTOWithId
        assertEquals(subject.getEventById(1), eventDTOWithId)
        verifySequence {
            mockEventService.getEventById(1)
        }
    }

    @Test
    fun `getEventsByUserId returns list of events created by a user`() {
        every { mockEventService.getEventsByUserId("1234") } returns listOf(eventDTOWithId)

        assertThat(subject.getEventsByUserId("1234")).containsExactlyInAnyOrderElementsOf(listOf(eventDTOWithId))
        verifySequence {
            mockEventService.getEventsByUserId("1234")
        }
    }
}