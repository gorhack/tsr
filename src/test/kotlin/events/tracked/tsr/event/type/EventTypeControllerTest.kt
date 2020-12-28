package events.tracked.tsr.event.type

import events.tracked.tsr.PageDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

internal class EventTypeControllerTest {
    private lateinit var subject: EventTypeController
    private lateinit var mockEventTypeService: EventTypeService
    private lateinit var firstEventType: EventTypeDTO
    private lateinit var secondEventType: EventTypeDTO
    private lateinit var expectedPageDTO: PageDTO<EventTypeDTO>

    @BeforeEach
    fun setup() {
        mockEventTypeService = mockk(relaxUnitFun = true)
        subject = EventTypeController(mockEventTypeService)
        firstEventType = EventTypeDTO(1L, "first", "first event", 1)
        secondEventType = EventTypeDTO(2L, "second", "second event", 2)
        expectedPageDTO = PageDTO(
            items = listOf(firstEventType, secondEventType),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )
    }

    @Test
    fun `returns page of event types`() {
        val expectedResponse: ResponseEntity<PageDTO<EventTypeDTO>> = ResponseEntity(
            expectedPageDTO, HttpStatus.OK
        )

        every { mockEventTypeService.getAllEventTypes(0, 10, Sort.by("sortOrder")) } returns expectedPageDTO

        assertEquals(expectedResponse, subject.allEventTypes(0, 10, "sortOrder"))
        verifySequence {
            mockEventTypeService.getAllEventTypes(0, 10, Sort.by("sortOrder"))
        }
    }

    @Test
    fun `without search terms returns page of event types`() {
        val expectedResponse: ResponseEntity<PageDTO<EventTypeDTO>> = ResponseEntity(
            expectedPageDTO, HttpStatus.OK
        )

        every { mockEventTypeService.getEventTypeContains("event", 0, 10, Sort.by("sortOrder")) } returns expectedPageDTO

        assertEquals(expectedResponse, subject.getEventTypeContains("event", 0, 10, "sortOrder"))
        verifySequence {
            mockEventTypeService.getEventTypeContains("event", 0, 10, Sort.by("sortOrder"))
        }
    }

    @Test
    fun `creates an event type`() {
        val eventTypeDTO = EventTypeDTO(eventTypeId = 0, displayName = "third", eventTypeName = "third", sortOrder = 0)
        val savedEventTypeDTO = EventTypeDTO(eventTypeId = 3L, eventTypeName = "third", displayName = "third", sortOrder = 3)
        every { mockEventTypeService.createEventType(eventTypeDTO) } returns savedEventTypeDTO
        assertEquals(ResponseEntity(savedEventTypeDTO, HttpStatus.CREATED), subject.createEventType(eventTypeDTO))
        verifySequence { mockEventTypeService.createEventType(eventTypeDTO) }
    }
}