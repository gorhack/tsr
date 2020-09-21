package events.tracked.tsr.event.task

import events.tracked.tsr.NewTsrEventTaskSaveEvent
import events.tracked.tsr.event.Event
import events.tracked.tsr.event.EventService
import events.tracked.tsr.makeEventWithId
import events.tracked.tsr.makeOidcUser
import events.tracked.tsr.organization.Organization
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserDTO
import events.tracked.tsr.user.TsrUserService
import events.tracked.tsr.user.UserRole
import io.mockk.*
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.context.ApplicationEventPublisher
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.time.OffsetDateTime

internal class EventTaskServiceTest {
    private lateinit var subject: EventTaskService
    private lateinit var mockEventTaskRepository: EventTaskRepository
    private lateinit var mockTsrUserService: TsrUserService
    private lateinit var mockEventService: EventService
    private lateinit var mockApplicationEventPublisher: ApplicationEventPublisher

    private var capturedTsrEventTaskSaveEvent = slot<NewTsrEventTaskSaveEvent>()

    private lateinit var eventWithId: Event

    @Before
    fun setup() {
        mockEventTaskRepository = mockk(relaxUnitFun = true)
        mockTsrUserService = mockk(relaxUnitFun = true)
        mockEventService = mockk(relaxUnitFun = true)
        mockApplicationEventPublisher = mockk()
        subject = EventTaskService(mockEventTaskRepository, mockTsrUserService, mockEventService, mockApplicationEventPublisher)

        every {
            mockApplicationEventPublisher.publishEvent(capture(capturedTsrEventTaskSaveEvent))
        } just Runs

        eventWithId = makeEventWithId()
    }

    @Test
    fun `createEventTask creates an event task`() {
        val suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00")

        val oidcUser = makeOidcUser("1234", "user")
        val tsrUser = TsrUser(1L, "1234", "user", UserRole.USER, mutableListOf())

        val eventTaskCategory = EventTaskCategory(eventTaskCategoryId = 1L, "CLASS", "class")
        val eventTaskStatus = EventTaskStatus(statusId = 1L, "CREATED", "created", 'R')

        val eventTaskToSave = EventTask(
            eventTaskCategoryId = eventTaskCategory,
            eventId = eventWithId,
            suspenseDate = suspenseDate,
            approver = tsrUser,
            resourcer = tsrUser,
            status = eventTaskStatus
        )

        val savedEventTask = EventTask(
            eventTaskId = 1L,
            eventTaskCategoryId = eventTaskCategory,
            eventId = eventWithId,
            suspenseDate = suspenseDate,
            approver = tsrUser,
            resourcer = tsrUser,
            status = eventTaskStatus,
            createdBy = "1234",
            createdDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
            lastModifiedBy = "1234",
            lastModifiedDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00")
        )

        every {
            mockTsrUserService.assertUserExistsAndReturnUser(oidcUser)
        } returns tsrUser
        every {
            mockEventService.getEventById(1)
        } returns eventWithId
        every {
            mockEventTaskRepository.saveAndFlush(eventTaskToSave)
        } returns savedEventTask

        assertEquals(savedEventTask, subject.createEventTask(oidcUser, 1, eventTaskCategory))
        verifySequence {
            mockTsrUserService.assertUserExistsAndReturnUser(oidcUser)
            mockEventService.getEventById(1)
            mockEventTaskRepository.saveAndFlush(eventTaskToSave)
        }
        assertEquals(savedEventTask, capturedTsrEventTaskSaveEvent.captured.eventTask)
    }
}