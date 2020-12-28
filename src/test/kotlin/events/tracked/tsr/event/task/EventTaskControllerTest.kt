package events.tracked.tsr.event.task

import events.tracked.tsr.*
import events.tracked.tsr.event.AuditDTO
import events.tracked.tsr.event.Event
import events.tracked.tsr.user.TsrUserDTO
import events.tracked.tsr.user.UserRole
import events.tracked.tsr.user.UserSettingsDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.verifySequence
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.time.OffsetDateTime

internal class EventTaskControllerTest {
    private lateinit var subject: EventTaskController
    private lateinit var mockEventTaskService: EventTaskService
    private lateinit var eventWithId: Event
    private lateinit var eventTask: EventTask
    private lateinit var eventTaskDTO: EventTaskDTO

    @BeforeEach
    fun setup() {
        mockEventTaskService = mockk(relaxUnitFun = true)
        subject = EventTaskController(mockEventTaskService)
        eventWithId = makeEventWithId()
        eventTask = makeEventTask()
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
        val eventTasksDTOs = listOf(
            eventTaskDTO,
            EventTaskDTO(
                eventId = 1L,
                eventTaskCategory = EventTaskCategory(eventTaskCategoryId = 4L, eventTaskName = "CLASS_FOUR", eventTaskDisplayName = "Class IV"),
                suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
                resourcer = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
                approver = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
                status = EventTaskStatus(1L, "CREATED", "created", EventTaskStatusCode.R, 2),
            )
        )
        every {
            mockEventTaskService.getEventTaskDTOs(1)
        } returns eventTasksDTOs
        val expectedResponse = ResponseEntity(eventTasksDTOs, HttpStatus.OK)
        assertEquals(expectedResponse, subject.getEventTasks(1))
        verifySequence {
            mockEventTaskService.getEventTaskDTOs(1)
        }
    }

    @Test
    fun `addComment adds a comment to the task`() {
        val comment = EventTaskCommentDTO(
            commentId = 14L,
            eventTaskId = 10L,
            annotation = "a really long comment"
        )
        val savedComment = EventTaskCommentDTO(
            commentId = 14L,
            eventTaskId = 10L,
            annotation = "a really long comment",
            audit = AuditDTO(
                createdBy = "1234",
                createdByDisplayName = "user",
                lastModifiedBy = "1234",
                lastModifiedByDisplayName = "user"
            )
        )
        every {
            mockEventTaskService.addComment(1, 10, comment)
        } returns savedComment
        val expectedResponse = ResponseEntity(savedComment, HttpStatus.CREATED)
        assertEquals(expectedResponse, subject.addComment(1, 10, comment))
    }
}