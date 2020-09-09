package events.tracked.tsr.event.type

import events.tracked.tsr.PageDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
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
    private lateinit var firstEventType: EventType
    private lateinit var secondEventType: EventType

    @BeforeEach
    fun setup() {
        mockEventTypeRepository = mockk(relaxUnitFun = true)
        subject = EventTypeService(mockEventTypeRepository)
        firstEventType = EventType(1L, "first", "first event", 1)
        secondEventType = EventType(2L, "second", "second event", 2)
    }


    @Test
    fun `getEventTypes returns list of all event_types`() {
        val paging: Pageable = PageRequest.of(0, 10, Sort.by("sortOrder"))

        val expectedPageDTO = PageDTO(
            items = listOf(firstEventType, secondEventType),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )

        every { mockEventTypeRepository.findAll(paging) } returns PageImpl(listOf(firstEventType, secondEventType), paging, 2)

        assertEquals(expectedPageDTO, subject.getAllEventTypes(0, 10, Sort.by("sortOrder")))
        verifySequence {
            mockEventTypeRepository.findAll(paging)
        }
    }

    @Test
    fun `getEventTypeContains returns page of all event types that contain search term`() {
        val paging: Pageable = PageRequest.of(0, 10, Sort.by("sortOrder"))

        val expectedPageDTO = PageDTO(
            items = listOf(firstEventType, secondEventType),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )

        every {
            mockEventTypeRepository.findByDisplayNameContains("event", paging)
        } returns PageImpl(listOf(firstEventType, secondEventType), paging, 2)

        assertEquals(expectedPageDTO, subject.getEventTypeContains("event", 0, 10, Sort.by("sortOrder")))
        verifySequence {
            mockEventTypeRepository.findByDisplayNameContains("event", paging)
        }
    }

    @Test
    fun `createEventType returns event type`() {
        val eventTypeDTO = EventType(displayName = "third", eventTypeName = "third")
        val eventTypeToSave = EventType(eventTypeId = 0L, eventTypeName = "third", displayName = "third", sortOrder = 3)
        val expectedEventType = EventType(eventTypeId = 3L, displayName = "third", eventTypeName = "third", sortOrder = 3)
        every { mockEventTypeRepository.count() } returns 2
        every {
            mockEventTypeRepository.save(eventTypeToSave)
        } returns expectedEventType

        assertEquals(expectedEventType, subject.createEventType(eventTypeDTO))
        verify {
            mockEventTypeRepository.count()
            mockEventTypeRepository.save(eventTypeToSave)
        }
    }
}