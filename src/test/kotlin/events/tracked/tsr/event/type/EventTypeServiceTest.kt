package events.tracked.tsr.event.type

import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class EventTypeServiceTest {
    private lateinit var subject: EventTypeService
    private lateinit var mockEventTypeRepository: EventTypeRepository

    @BeforeEach
    fun setup() {
        mockEventTypeRepository = mockk(relaxUnitFun = true)
        subject = EventTypeService(mockEventTypeRepository)
    }


    @Test
    fun `getEventTypes returns list of all event_types`() {
        val eventType1 = EventType(1L, "first", "first event", 1)
        val eventType2 = EventType(2L, "second", "second event", 2)

        every { mockEventTypeRepository.findAll() } returns listOf(eventType1, eventType2)

        Assertions.assertThat(subject.getAllEventTypes()).containsExactlyInAnyOrderElementsOf(listOf(eventType2, eventType1))
        verifySequence {
            mockEventTypeRepository.findAll()
        }
    }
}