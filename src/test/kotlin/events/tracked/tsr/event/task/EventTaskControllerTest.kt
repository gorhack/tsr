package events.tracked.tsr.event.task

import events.tracked.tsr.event.Event
import events.tracked.tsr.makeEventWithId
import events.tracked.tsr.makeOidcUser
import events.tracked.tsr.user.TsrUser
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

    @Before
    fun setup() {
        mockEventTaskService = mockk(relaxUnitFun = true)
        subject = EventTaskController(mockEventTaskService)
        eventWithId = makeEventWithId()
    }

    @Test
    fun `createEventTask creates a task for an event`() {
        val oidcUser = makeOidcUser("1234", "user")

        val taskToCreate = EventTaskCategory(eventTaskCategoryId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I")
        val createdEventTask = EventTask(
            eventId = eventWithId,
            eventTaskCategoryId = EventTaskCategory(eventTaskCategoryId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I"),
            suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
            resourcer = TsrUser(1L, "1234", "user", UserRole.USER),
            approver = TsrUser(1L, "1234", "user", UserRole.USER),
            status = EventTaskStatus(1L, "CREATED", "created", 'R'),
        )
        val createdTaskDTO = EventTaskDTO(
            eventId = 1L,
            eventTaskCategory = EventTaskCategory(eventTaskCategoryId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I"),
            suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
            resourcer = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
            approver = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
            status = EventTaskStatus(1L, "CREATED", "created", 'R'),
        )

        val expectedResponse = ResponseEntity(createdTaskDTO, HttpStatus.CREATED)

        every {
            mockEventTaskService.createEventTask(oidcUser, 1, taskToCreate)
        } returns createdEventTask

        assertEquals(expectedResponse, subject.createEventTask(oidcUser, 1, taskToCreate))
        verifySequence {
            mockEventTaskService.createEventTask(oidcUser, 1, taskToCreate)
        }
    }
}