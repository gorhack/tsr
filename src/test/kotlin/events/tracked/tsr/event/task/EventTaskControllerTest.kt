package events.tracked.tsr.event.task

import events.tracked.tsr.*
import events.tracked.tsr.event.Event
import events.tracked.tsr.user.TsrUserDTO
import events.tracked.tsr.user.UserRole
import events.tracked.tsr.user.UserSettingsDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.time.OffsetDateTime

internal class EventTaskControllerTest {
    private lateinit var subject: EventTaskController
    private lateinit var mockEventTaskService: EventTaskService
    private lateinit var eventWithId: Event
    private lateinit var eventTask: EventTask
    private lateinit var eventTask2: EventTask
    private lateinit var eventTaskDTO: EventTaskDTO

    @Before
    fun setup() {
        mockEventTaskService = mockk(relaxUnitFun = true)
        subject = EventTaskController(mockEventTaskService)
        eventWithId = makeEventWithId()
        eventTask = makeEventTask()
        eventTask2 = makeEventTask2()
        eventTaskDTO = makeEventTaskDTO()
    }

    @Test
    fun `createEventTask creates a task for an event`() {
        val oidcUser = makeOidcUser("1234", "user")

        val taskToCreate = EventTaskCategory(eventTaskCategoryId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I")

        val expectedResponse = ResponseEntity(eventTaskDTO, HttpStatus.CREATED)

        every {
            mockEventTaskService.createEventTask(oidcUser, 1, taskToCreate)
        } returns eventTask

        assertEquals(expectedResponse, subject.createEventTask(oidcUser, 1, taskToCreate))
        verifySequence {
            mockEventTaskService.createEventTask(oidcUser, 1, taskToCreate)
        }
    }

    @Test
    fun `getEventTasks returns list of event tasks`() {
        val eventTasks = listOf(
            eventTask,
            eventTask2
        )
        val eventTasksDTOs = listOf(
            eventTaskDTO,
            EventTaskDTO(
                eventId = 1L,
                eventTaskCategory = EventTaskCategory(eventTaskCategoryId = 4L, eventTaskName = "CLASS_FOUR", eventTaskDisplayName = "Class IV"),
                suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
                resourcer = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
                approver = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
                status = EventTaskStatus(1L, "CREATED", "created", 'R'),
            )
        )
        every {
            mockEventTaskService.getEventTasks(1)
        } returns eventTasks
        val expectedResponse = ResponseEntity(eventTasksDTOs, HttpStatus.OK)
        assertEquals(expectedResponse, subject.getEventTasks(1))
        verifySequence {
            mockEventTaskService.getEventTasks(1)
        }
    }
}