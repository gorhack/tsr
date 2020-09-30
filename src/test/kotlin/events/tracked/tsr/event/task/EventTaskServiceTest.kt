package events.tracked.tsr.event.task

import events.tracked.tsr.*
import events.tracked.tsr.event.AuditDTO
import events.tracked.tsr.event.Event
import events.tracked.tsr.event.EventService
import events.tracked.tsr.user.*
import io.mockk.*
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import java.time.OffsetDateTime

internal class EventTaskServiceTest {
    private lateinit var subject: EventTaskService
    private lateinit var mockEventTaskRepository: EventTaskRepository
    private lateinit var mockTsrUserService: TsrUserService
    private lateinit var mockEventService: EventService
    private lateinit var mockApplicationEventPublisher: ApplicationEventPublisher

    private var capturedTsrEventTaskSaveEvent = slot<NewTsrEventTaskSaveEvent>()
    private var capturedNewCommentTsrEventTaskEvent = slot<NewEventTaskCommentEvent>()

    private lateinit var eventWithId: Event
    private lateinit var eventTask: EventTask
    private lateinit var eventTaskDTO: EventTaskDTO
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
        every {
            mockApplicationEventPublisher.publishEvent(capture(capturedNewCommentTsrEventTaskEvent))
        } just Runs

        eventWithId = makeEventWithId()
        eventTask = makeEventTask()
        eventTaskDTO = makeEventTaskDTO()
        eventTask2 = makeEventTask2()
    }

    @Test
    fun `createEventTask creates an event task`() {
        val suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00")

        val oidcUser = makeOidcUser("1234", "user")
        val tsrUser = TsrUser(1L, "1234", "user", UserRole.USER, hashSetOf())

        val eventTaskCategory = EventTaskCategory(eventTaskCategoryId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I")

        val eventTaskToSave = EventTask(
            eventTaskCategory = eventTaskCategory,
            event = eventWithId,
            suspenseDate = suspenseDate,
            approver = tsrUser,
        )

        every {
            mockTsrUserService.assertUserExistsAndReturnUser(oidcUser)
        } returns tsrUser
        every {
            mockEventService.getEventById(1)
        } returns eventWithId
        every {
            mockEventTaskRepository.saveAndFlush(eventTaskToSave)
        } returns eventTask
        assertEquals(eventTask, subject.createEventTask(oidcUser, 1, eventTaskCategory))
        verifySequence {
            mockTsrUserService.assertUserExistsAndReturnUser(oidcUser)
            mockEventService.getEventById(1)
            mockEventTaskRepository.saveAndFlush(eventTaskToSave)
        }
        assertEquals(eventTask, capturedTsrEventTaskSaveEvent.captured.eventTask)
    }

    @Test
    fun `getEventTasksDTOs gets a list of event tasks`() {
        val eventTasks = listOf(eventTask, eventTask2)
        val eventTaskDTOs = listOf(
            eventTaskDTO,
            EventTaskDTO(
                eventTaskId = 2L,
                eventTaskCategory = EventTaskCategory(eventTaskCategoryId = 4L, eventTaskName = "CLASS_FOUR", eventTaskDisplayName = "Class IV"),
                eventId = 1L,
                suspenseDate = janFirstDate,
                approver = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
                comments = listOf(
                    EventTaskCommentDTO(
                        commentId = 1L,
                        eventTaskId = 2L,
                        annotation = "first annotation",
                        audit = AuditDTO(
                            createdBy = "1234",
                            createdDate = janFirstDate,
                            createdByDisplayName = "user",
                            lastModifiedBy = "1234",
                            lastModifiedDate = janFirstDate,
                            lastModifiedByDisplayName = "user"
                        )
                    ),
                    EventTaskCommentDTO(
                        commentId = 2L,
                        eventTaskId = 2L,
                        annotation = "second annotation",
                        audit = AuditDTO(
                            createdBy = "0987",
                            createdDate = janSecondDate,
                            createdByDisplayName = "user 2",
                            lastModifiedBy = "1234",
                            lastModifiedDate = janSecondDate,
                            lastModifiedByDisplayName = "user"
                        )
                    )
                )
            )
        )
        every {
            mockEventTaskRepository.findAllByEventEventId(1L)
        } returns eventTasks
        every {
            mockTsrUserService.findByUserId("1234")
        } returns TsrUser(userId = "1234", username = "user")
        every {
            mockTsrUserService.findByUserId("0987")
        } returns TsrUser(userId = "0987", username = "user 2")

        assertEquals(eventTaskDTOs, subject.getEventTaskDTOs(1))
        verifySequence {
            mockEventTaskRepository.findAllByEventEventId(1L)
            mockTsrUserService.findByUserId("1234")
            mockTsrUserService.findByUserId("0987")
        }
    }

    @Test
    fun `addComment adds a comment to an event task`() {
        val tsrUser = TsrUser(1L, "1234", "user")

        val initialCommentDTO = EventTaskCommentDTO(commentId = 40L, eventTaskId = 1L, annotation = "first annotation")
        val savedComment = EventTaskComment(
            commentId = 40L,
            eventTask = EventTask(eventTaskId = 1L),
            annotation = "first annotation",
            createdBy = "1234",
            createdDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
            lastModifiedBy = "1234",
            lastModifiedDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00")
        )
        val savedCommentDTO = EventTaskCommentDTO(
            commentId = 40L,
            eventTaskId = 1L,
            annotation = "first annotation",
            audit = AuditDTO(
                createdBy = "1234",
                createdDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
                createdByDisplayName = "user",
                lastModifiedBy = "1234",
                lastModifiedDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
                lastModifiedByDisplayName = "user"
            )
        )

        every { mockEventTaskRepository.findByIdOrNull(1L) } returns eventTask
        every {
            mockTsrUserService.findByUserId("1234")
        } returns tsrUser
        every {
            mockEventTaskRepository.saveAndFlush(eventTask)
        } returns eventTask.copy(comments = hashSetOf(savedComment))

        assertEquals(savedCommentDTO, subject.addComment(1, 1, initialCommentDTO))

        verifySequence {
            mockEventTaskRepository.findByIdOrNull(1L)
            mockEventTaskRepository.saveAndFlush(eventTask)
            mockTsrUserService.findByUserId("1234")
        }
        assertEquals(1, capturedNewCommentTsrEventTaskEvent.captured.eventId)
        assertEquals(savedCommentDTO, capturedNewCommentTsrEventTaskEvent.captured.comment)
    }
}