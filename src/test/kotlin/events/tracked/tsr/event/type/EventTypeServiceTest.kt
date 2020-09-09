package events.tracked.tsr.event.type

import events.tracked.tsr.PageDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort

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
        val paging: Pageable = PageRequest.of(0, 10, Sort.by("sortOrder"))

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

        every { mockEventTypeRepository.findAll(paging) } returns PageImpl(listOf(eventType1, eventType2), paging, 2)

        assertEquals(expectedPageDTO, subject.getAllEventTypes(0, 10, Sort.by("sortOrder")))
        verifySequence {
            mockEventTypeRepository.findAll(paging)
        }
    }

    @Test
    fun `getEventTypeContains with empty value returns list of all event_types`() {
        val paging: Pageable = PageRequest.of(0, 10, Sort.by("sortOrder"))

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

        every { mockEventTypeRepository.findByDisplayNameContains("", paging) } returns PageImpl(listOf(eventType1, eventType2), paging, 2)

        assertEquals(expectedPageDTO, subject.getEventTypeContains("", 0, 10, Sort.by("sortOrder")))
        verifySequence {
            mockEventTypeRepository.findByDisplayNameContains("", paging)
        }
    }
}