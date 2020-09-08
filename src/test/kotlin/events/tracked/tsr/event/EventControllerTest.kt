package events.tracked.tsr.event

import events.tracked.tsr.PageDTO
import events.tracked.tsr.makeEventDTOWithId
import events.tracked.tsr.makeEventDTOWithId2
import events.tracked.tsr.makeEventDTOWithoutId
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

internal class EventControllerTest {
    private lateinit var subject: EventController
    private lateinit var mockEventService: EventService
    private lateinit var eventDTOWithoutId: EventDTO
    private lateinit var eventDTOWithId: EventDTO
    private lateinit var eventDTOWithId2: EventDTO
    private lateinit var expectedPageDTO: PageDTO<EventDTO>
    private lateinit var defaultSortBy: Sort
    private lateinit var eventDTOWithIdAndDisplayNames: EventDTO

    @Before
    fun setup() {
        mockEventService = mockk(relaxUnitFun = true)
        subject = EventController(mockEventService)

        eventDTOWithoutId = makeEventDTOWithoutId()
        eventDTOWithId = makeEventDTOWithId()
        eventDTOWithId2 = makeEventDTOWithId2()
        expectedPageDTO = PageDTO(
            items = listOf(eventDTOWithId, eventDTOWithId2),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )
        eventDTOWithIdAndDisplayNames = eventDTOWithId.copy(
            audit = eventDTOWithId.audit?.copy(
                createdByDisplayName = "user",
                lastModifiedByDisplayName = "user_2"
            )
        )
        defaultSortBy = Sort.by("startDate").and(Sort.by("endDate"))
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
    fun `returns page of events sorted by startDate then endDate that end after today`() {
        val expectedResponse: ResponseEntity<PageDTO<EventDTO>> = ResponseEntity(
            expectedPageDTO, HttpStatus.OK
        )

        every {
            mockEventService.getAllEventsEndingAfterToday(0, 10, defaultSortBy)
        } returns expectedPageDTO

        assertEquals(expectedResponse, subject.getCurrentAndFutureEventsPage(0, 10, "startDate"))
        verifySequence {
            mockEventService.getAllEventsEndingAfterToday(0, 10, defaultSortBy)
        }
    }

    @Test
    fun `getEventById returns a page of current and future events by user id`() {
        every { mockEventService.getEventById(1) } returns eventDTOWithId
        assertEquals(subject.getEventById(1), eventDTOWithId)
        verifySequence {
            mockEventService.getEventById(1)
        }
    }

    @Test
    fun `getAllEventsEndingAfterTodayByUserId returns list of events created by a user`() {
        val expectedResponse: ResponseEntity<PageDTO<EventDTO>> = ResponseEntity(
            expectedPageDTO, HttpStatus.OK
        )
        every {
            mockEventService.getAllEventsEndingAfterTodayByUserId("1234", 0, 10, defaultSortBy)
        } returns expectedPageDTO

        assertEquals(expectedResponse, subject.getAllEventsEndingAfterTodayByUserId("1234", 0, 10, "startDate"))
        verifySequence {
            mockEventService.getAllEventsEndingAfterTodayByUserId("1234", 0, 10, defaultSortBy)
        }
    }
}