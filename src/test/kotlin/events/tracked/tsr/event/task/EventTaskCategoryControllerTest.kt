package events.tracked.tsr.event.task

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

internal class EventTaskCategoryControllerTest {
    private lateinit var subject: EventTaskCategoryController
    private lateinit var mockEventTaskCategoryService: EventTaskCategoryService

    @BeforeEach
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
            mockEventTaskCategoryService.getEventTaskCategories("", 0, 10, Sort.by("eventTaskCategoryId"))
        } returns expectedPageDTO

        assertEquals(expectedResponse, subject.getEventTaskCategories("", 0, 10, "eventTaskCategoryId"))
        verifySequence {
            mockEventTaskCategoryService.getEventTaskCategories("", 0, 10, Sort.by("eventTaskCategoryId"))
        }
    }

    @Test
    fun `createEventTaskCategory returns page of created task category` () {
        val eventTaskCategoryToCreate = EventTaskCategoryDTO(0L, "third", "third")
        val createdEventTaskCategoryDTO = eventTaskCategoryToCreate.copy(3L)
        val expectedResponse: ResponseEntity<EventTaskCategoryDTO> = ResponseEntity(createdEventTaskCategoryDTO, HttpStatus.CREATED)

        every{
            mockEventTaskCategoryService.createEventTaskCategory(eventTaskCategoryToCreate)
        } returns createdEventTaskCategoryDTO

        assertEquals(expectedResponse, subject.createEventTaskCategory(eventTaskCategoryToCreate))
        verifySequence { mockEventTaskCategoryService.createEventTaskCategory(eventTaskCategoryToCreate) }
    }
}