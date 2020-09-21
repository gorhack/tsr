package events.tracked.tsr.event.task

import events.tracked.tsr.*
import events.tracked.tsr.event.Event
import events.tracked.tsr.event.EventService
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserService
import events.tracked.tsr.user.UserRole
import io.mockk.*
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

internal class EventTaskServiceTest {
    private lateinit var subject: EventTaskService
    private lateinit var mockEventTaskRepository: EventTaskRepository
    private lateinit var mockTsrUserService: TsrUserService
    private lateinit var mockEventService: EventService
    private lateinit var mockApplicationEventPublisher: ApplicationEventPublisher

    private var capturedTsrEventTaskSaveEvent = slot<NewTsrEventTaskSaveEvent>()

    private lateinit var eventWithId: Event
    private lateinit var eventTask: EventTask
    private lateinit var eventTask2: EventTask

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
        eventTask = makeEventTask()
        eventTask2 = makeEventTask2()
    }

    @Test
    fun `createEventTask creates an event task`() {
        val suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00")

        val oidcUser = makeOidcUser("1234", "user")
        val tsrUser = TsrUser(1L, "1234", "user", UserRole.USER, mutableListOf())

        val eventTaskCategory = EventTaskCategory(eventTaskCategoryId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I")
        val eventTaskStatus = EventTaskStatus(statusId = 1L, "CREATED", "created", 'R')

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
            mockEventTaskRepository.saveAndFlush(eventTask)
        } returns savedEventTask

        assertEquals(savedEventTask, subject.createEventTask(oidcUser, 1, eventTaskCategory))
        verifySequence {
            mockTsrUserService.assertUserExistsAndReturnUser(oidcUser)
            mockEventService.getEventById(1)
            mockEventTaskRepository.saveAndFlush(eventTask)
        }
        assertEquals(savedEventTask, capturedTsrEventTaskSaveEvent.captured.eventTask)
    }

    @Test
    fun `getEventTasks gets a list of event tasks`() {
        val eventTasks = listOf(eventTask, eventTask2)
        every {
            mockEventService.getEventById(1)
        } returns eventWithId
        every {
            mockEventTaskRepository.findAllByEventId(eventWithId)
        } returns eventTasks
        assertEquals(eventTasks, subject.getEventTasks(1))
        verifySequence {
            mockEventService.getEventById(1)
            mockEventTaskRepository.findAllByEventId(eventWithId)
        }
    }
}