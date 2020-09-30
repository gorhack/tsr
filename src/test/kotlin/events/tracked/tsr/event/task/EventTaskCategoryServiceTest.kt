package events.tracked.tsr.event.task

import events.tracked.tsr.PageDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort

internal class EventTaskCategoryServiceTest {
    private lateinit var subject: EventTaskCategoryService
    private lateinit var mockEventTaskCategoryRepository: EventTaskCategoryRepository

    @Before
    fun setup() {
        mockEventTaskCategoryRepository = mockk(relaxUnitFun = true)
        subject = EventTaskCategoryService(mockEventTaskCategoryRepository)
    }

    @Test
    fun `getEventTaskCategories gets a page of event task categories`() {
        val firstEventTask = EventTaskCategory(1L, "FIRST", "first event task")
        val secondEventTask = EventTaskCategory(2L, "SECOND", "second event task")
        val paging: Pageable = PageRequest.of(0, 10, Sort.by("eventTaskId"))
        val expectedPageDTO = PageDTO(
            items = listOf(firstEventTask, secondEventTask),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )
        every {
            mockEventTaskCategoryRepository.findByEventTaskDisplayNameContainsIgnoreCase("", paging)
        } returns PageImpl(listOf(firstEventTask, secondEventTask), paging, 2)
        assertEquals(expectedPageDTO, subject.getEventTaskCategories("", 0, 10, Sort.by("eventTaskId")))
    }

    @Test
    fun `createEventTaskCategory returns a page of the created task category`() {
        val eventTaskCategoryToCreate = EventTaskCategory(0L,"third","third")
        val createdEventTaskCategory = eventTaskCategoryToCreate.copy(3L)
        val eventTaskCategoryToCreateDTO = EventTaskCategoryDTO(0L,"third","third")
        val createdEventTaskCategoryDTO = eventTaskCategoryToCreateDTO.copy(3L)
        every { mockEventTaskCategoryRepository.save(eventTaskCategoryToCreate) } returns createdEventTaskCategory
        assertEquals(createdEventTaskCategoryDTO, subject.createEventTaskCategory(eventTaskCategoryToCreateDTO))
        verify { mockEventTaskCategoryRepository.save(eventTaskCategoryToCreate) }
    }
}