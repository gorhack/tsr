package events.tracked.tsr.event.task

import events.tracked.tsr.NewTsrEventTaskSaveEvent
import events.tracked.tsr.event.Event
import events.tracked.tsr.event.EventRepository
import events.tracked.tsr.organization.Organization
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserDTO
import events.tracked.tsr.user.UserRole
import io.mockk.*
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.time.OffsetDateTime

internal class EventTaskServiceTest {
    private lateinit var subject: EventTaskService
    private lateinit var mockEventTaskRepository: EventTaskRepository
    private lateinit var mockEventRepository: EventRepository
    private lateinit var mockApplicationEventPublisher: ApplicationEventPublisher

    private var capturedTsrEventTaskSaveEvent = slot<NewTsrEventTaskSaveEvent>()

    @Before
    fun setup() {
        mockEventTaskRepository = mockk(relaxUnitFun = true)
        mockEventRepository = mockk(relaxUnitFun = true)
        mockApplicationEventPublisher = mockk()
        subject = EventTaskService(mockEventTaskRepository, mockEventRepository, mockApplicationEventPublisher)

        every {
            mockApplicationEventPublisher.publishEvent(capture(capturedTsrEventTaskSaveEvent))
        } just Runs
    }

    @Test
    fun `createEventTask creates an event task`() {
        val suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00")

        val event = Event(
            eventId = 1L,
            eventName = "some event",
            startDate = suspenseDate,
            endDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
            eventType = null,
            organization = Organization(),
            createdBy = "1234",
            createdDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
            lastModifiedBy = "1234",
            lastModifiedDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00")
        )
        val tsrUser = TsrUser(1L, "1234", "user", UserRole.USER, mutableListOf())

        val eventTaskCategory = EventTaskCategory(eventTaskId = 1L, "CLASS", "class")
        val eventTaskStatus = EventTaskStatus(statusId = 1L, "CREATED", "created", 'R')
        val createTask = CreateEventTaskDTO(
            eventTaskCategory = eventTaskCategory,
            eventId = 1L
        )
        val eventTaskToSave = EventTask(
            eventTaskCategoryId = eventTaskCategory,
            eventId = event,
            suspenseDate = suspenseDate,
            approver = tsrUser,
            resourcer = tsrUser,
            status = eventTaskStatus
        )

        val savedEventTask = EventTask(
            eventTaskCategoryId = eventTaskCategory,
            eventId = event,
            suspenseDate = suspenseDate,
            approver = tsrUser,
            resourcer = tsrUser,
            status = eventTaskStatus,
            createdBy = "1234",
            createdDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
            lastModifiedBy = "1234",
            lastModifiedDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00")
        )

        val savedEventTaskDTO = EventTaskDTO(
            eventTaskCategory = eventTaskCategory,
            eventId = 1L,
            suspenseDate = suspenseDate,
            approver = TsrUserDTO(tsrUser),
            resourcer = TsrUserDTO(tsrUser),
            status = eventTaskStatus,
        )
        every {
            mockEventRepository.findByIdOrNull(1L)
        } returns event
        every {
            mockEventTaskRepository.saveAndFlush(eventTaskToSave)
        } returns savedEventTask

        val response = ResponseEntity(savedEventTaskDTO, HttpStatus.CREATED)
        assertEquals(response, subject.createEventTask(tsrUser, createTask))
        verifySequence {
            mockEventRepository.findByIdOrNull(1L)
            mockEventTaskRepository.saveAndFlush(eventTaskToSave)
        }
        assertEquals(savedEventTask, capturedTsrEventTaskSaveEvent.captured.eventTask)
    }
}