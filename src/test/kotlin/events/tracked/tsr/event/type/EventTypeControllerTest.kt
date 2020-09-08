package events.tracked.tsr.event.type

import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test

internal class EventTypeControllerTest {
    private lateinit var subject: EventTypeController
    private lateinit var mockEventTypeService: EventTypeService

    @Before
    fun setup() {
        mockEventTypeService = mockk(relaxUnitFun = true)
        subject = EventTypeController(mockEventTypeService)
    }

    @Test
    fun `returns all event types`() {
        val eventType1 = EventType(1L, "first", "first event", 1)
        val eventType2 = EventType(2L, "second", "second event", 2)

        every { mockEventTypeService.getAllEventTypes() } returns listOf(eventType1, eventType2)

        assertThat(subject.allEventTypes()).containsExactlyInAnyOrderElementsOf(listOf(eventType2, eventType1))
        verifySequence {
            mockEventTypeService.getAllEventTypes()
        }
    }
}