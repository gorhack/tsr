package events.tracked.tsr.event.task

import events.tracked.tsr.makeOidcUser
import events.tracked.tsr.user.*
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
    private lateinit var mockTsrUserService: TsrUserService

    @Before
    fun setup() {
        mockEventTaskService = mockk(relaxUnitFun = true)
        mockTsrUserService = mockk(relaxUnitFun = true)
        subject = EventTaskController(mockEventTaskService, mockTsrUserService)
    }

    @Test
    fun `createEventTask creates a task for an event`() {
        val oidcUser = makeOidcUser("1234", "user")
        val tsrUser = TsrUser(1L, "1234", "user", UserRole.USER, mutableListOf())

        val taskToCreate = CreateEventTaskDTO(
            eventId = 1L,
            eventTaskCategory = EventTaskCategory(eventTaskId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I"),
        )
        val createdTaskDTO = EventTaskDTO(
            eventId = 1L,
            eventTaskCategory = EventTaskCategory(eventTaskId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I"),
            suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
            resourcer = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
            approver = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
            status = EventTaskStatus(1L, "CREATED", "created", 'R'),
        )
        val expectedResponse: ResponseEntity<EventTaskDTO> = ResponseEntity(createdTaskDTO, HttpStatus.CREATED)
        every {
            mockTsrUserService.assertUserExistsAndReturnUser(oidcUser)
        } returns tsrUser
        every {
            mockEventTaskService.createEventTask(tsrUser, taskToCreate)
        } returns expectedResponse

        assertEquals(expectedResponse, subject.createEventTask(oidcUser, taskToCreate))
        verifySequence {
            mockTsrUserService.assertUserExistsAndReturnUser(oidcUser)
            mockEventTaskService.createEventTask(tsrUser, taskToCreate)
        }
    }
}