package events.tracked.tsr.event

import events.tracked.tsr.*
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserRepository
import events.tracked.tsr.user.UserRole
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
import org.springframework.data.repository.findByIdOrNull

class EventServiceTest {
    private lateinit var subject: EventService
    private lateinit var mockEventRepository: EventRepository
    private lateinit var mockTsrUserRepository: TsrUserRepository
    private lateinit var eventWithoutId: Event
    private lateinit var eventDTOWithoutId: EventDTO
    private lateinit var eventWithId: Event
    private lateinit var eventWithId2: Event
    private lateinit var eventDTOWithId: EventDTO
    private lateinit var eventDTOWithId2: EventDTO
    private lateinit var eventDTOWithIdAndDisplayNames: EventDTO
    private lateinit var expectedPageDTO: PageDTO<EventDTO>

    @BeforeEach
    fun setup() {
        mockEventRepository = mockk(relaxUnitFun = true)
        mockTsrUserRepository = mockk(relaxUnitFun = true)
        subject = EventService(mockEventRepository, mockTsrUserRepository)

        eventWithoutId = makeEventWithoutId()
        eventDTOWithoutId = makeEventDTOWithoutId()

        eventWithId = makeEventWithId()
        eventWithId2 = makeEventWithId2()
        eventDTOWithId = makeEventDTOWithId()
        eventDTOWithId2 = makeEventDTOWithId2()

        eventDTOWithIdAndDisplayNames = eventDTOWithId.copy(
            audit = eventDTOWithId.audit?.copy(
                createdByDisplayName = "user",
                lastModifiedByDisplayName = "user_2"
            )
        )
        expectedPageDTO = PageDTO(
            items = listOf(eventDTOWithId, eventDTOWithId2),
            totalPages = 1,
            totalResults = 2,
            pageNumber = 0,
            isFirst = true,
            isLast = true,
            pageSize = 10
        )
    }

    @Test
    fun `saveEvent returns EventDTO with id and auditable filled out`() {
        val unsavedEvent = eventWithoutId
        val unsavedEventDTO = eventDTOWithoutId
        val savedEvent = eventWithId
        val savedEventDTO = eventDTOWithId
        every { mockEventRepository.save(unsavedEvent) } returns savedEvent
        assertEquals(savedEventDTO, subject.saveEvent(unsavedEventDTO))
        verifySequence {
            mockEventRepository.save(unsavedEvent)
        }
    }

    @Test
    fun `getActiveEvents returns PageDTO of EventDTOs list of all events that end after today`() {
        val paging: Pageable = PageRequest.of(0, 10, Sort.by("startDate"))
        every { mockEventRepository.findByEndDateGreaterThanEqual(any(), paging) } returns PageImpl(listOf(eventWithId, eventWithId2), paging, 2)
        assertEquals(expectedPageDTO, subject.getActiveEvents(0, 10, Sort.by("startDate")))
        verifySequence {
            mockEventRepository.findByEndDateGreaterThanEqual(any(), paging)
        }
    }

    @Test
    fun `getEventById returns an event with display names`() {
        every { mockEventRepository.findByIdOrNull(1L) } returns eventWithId
        every { mockTsrUserRepository.findByUserId("1234") } returns TsrUser(1L, "1234", "user", UserRole.USER)
        every { mockTsrUserRepository.findByUserId("6789") } returns TsrUser(2L, "6789", "user_2", UserRole.USER)
        assertEquals(eventDTOWithIdAndDisplayNames, subject.getEventById(1))
        verifySequence {
            mockEventRepository.findByIdOrNull(1L)
            mockTsrUserRepository.findByUserId("1234")
            mockTsrUserRepository.findByUserId("6789")
        }
    }

    @Test
    fun `getActiveEventsByUserId returns page of events created by a user`() {
        val paging: Pageable = PageRequest.of(0, 10, Sort.by("startDate"))
        every { mockEventRepository.findByCreatedByAndEndDateGreaterThanEqual("1234", any(), paging) } returns PageImpl(listOf(eventWithId, eventWithId2), paging, 2)
        assertEquals(expectedPageDTO, subject.getActiveEventsByUserId("1234", 0, 10, Sort.by("startDate")))
    }
}