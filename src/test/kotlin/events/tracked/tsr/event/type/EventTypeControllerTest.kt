package events.tracked.tsr.event.type

import events.tracked.tsr.PageDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

internal class EventTypeControllerTest {
    private lateinit var subject: EventTypeController
    private lateinit var mockEventTypeService: EventTypeService

    @Before
    fun setup() {
        mockEventTypeService = mockk(relaxUnitFun = true)
        subject = EventTypeController(mockEventTypeService)
    }

    @Test
    fun `returns page of event types`() {
        val eventType1 = EventType(1L, "first", "first event", 1)
        val eventType2 = EventType(2L, "second", "second event", 2)
        val expectedPageDTO = PageDTO(
            items = listOf(eventType1, eventType2),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )
        val expectedResponse: ResponseEntity<PageDTO<EventType>> = ResponseEntity(
            expectedPageDTO, HttpStatus.OK
        )

        every { mockEventTypeService.getAllEventTypes(0, 10, Sort.by("sortOrder")) } returns expectedPageDTO

        assertEquals(expectedResponse, subject.allEventTypes(0, 10, "sortOrder"))
        verifySequence {
            mockEventTypeService.getAllEventTypes(0, 10, Sort.by("sortOrder"))
        }
    }

    @Test
    fun `without search terms, returns page of event types`() {
        val eventType1 = EventType(1L, "first", "first event", 1)
        val eventType2 = EventType(2L, "second", "second event", 2)
        val expectedPageDTO = PageDTO(
            items = listOf(eventType1, eventType2),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )
        val expectedResponse: ResponseEntity<PageDTO<EventType>> = ResponseEntity(
            expectedPageDTO, HttpStatus.OK
        )

        every { mockEventTypeService.getEventTypeContains(null, 0, 10, Sort.by("sortOrder")) } returns expectedPageDTO

        assertEquals(expectedResponse, subject.getEventTypeContains(null, 0, 10, "sortOrder"))
        verifySequence {
            mockEventTypeService.getEventTypeContains(null, 0, 10, Sort.by("sortOrder"))
        }
    }
}