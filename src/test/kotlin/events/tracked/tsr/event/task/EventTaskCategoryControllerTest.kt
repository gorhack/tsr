package events.tracked.tsr.event.task

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

internal class EventTaskCategoryControllerTest {
    private lateinit var subject: EventTaskCategoryController
    private lateinit var mockEventTaskCategoryService: EventTaskCategoryService

    @Before
    fun setup() {
        mockEventTaskCategoryService = mockk(relaxUnitFun = true)
        subject = EventTaskCategoryController(mockEventTaskCategoryService)
    }

    @Test
    fun `getEventTaskCategories returns a page of event task categories`() {
        val firstEventTask = EventTaskCategory(1L, "FIRST", "first event task")
        val secondEventTask = EventTaskCategory(2L, "SECOND", "second event task")
        val expectedPageDTO = PageDTO(
            items = listOf(firstEventTask, secondEventTask),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )
        val expectedResponse: ResponseEntity<PageDTO<EventTaskCategory>> = ResponseEntity(expectedPageDTO, HttpStatus.OK)

        every {
            mockEventTaskCategoryService.getEventTaskCategories("", 0, 10, Sort.by("eventTaskId"))
        } returns expectedPageDTO

        assertEquals(expectedResponse, subject.getEventTaskCategories("", 0, 10, "eventTaskId"))
        verifySequence {
            mockEventTaskCategoryService.getEventTaskCategories("", 0, 10, Sort.by("eventTaskId"))
        }
    }
}