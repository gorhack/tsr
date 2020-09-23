package events.tracked.tsr.event.task

import events.tracked.tsr.NewEventTaskCommentEvent
import events.tracked.tsr.NewTsrEventTaskSaveEvent
import events.tracked.tsr.event.EventService
import events.tracked.tsr.user.TsrUserService
import org.springframework.context.ApplicationEventPublisher
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.stereotype.Service
import javax.transaction.Transactional

@Service
class EventTaskService(
    private val eventTaskRepository: EventTaskRepository,
    private val eventTaskCommentRepository: EventTaskCommentRepository,
    private val tsrUserService: TsrUserService,
    private val eventService: EventService,
    private val applicationEventPublisher: ApplicationEventPublisher
) {
    @Transactional
    fun createEventTask(oidcUser: OidcUser, eventId: Int, taskToCreate: EventTaskCategory): EventTask {
        val tsrUser = tsrUserService.assertUserExistsAndReturnUser(oidcUser)
        val event = eventService.getEventById(eventId)
        val eventTaskToSave = EventTask(
            eventTaskCategoryId = taskToCreate,
            eventId = event,
            suspenseDate = event.startDate,
            approver = tsrUser,
            resourcer = tsrUser
        )
        val eventTask = eventTaskRepository.saveAndFlush(eventTaskToSave)
        applicationEventPublisher.publishEvent(NewTsrEventTaskSaveEvent(this, eventTask))
        return eventTask
    }

    fun getCommentDisplayNames(eventTaskId: Long, comment: EventTaskComment): EventTaskCommentDTO {
        val createdByUser: String = tsrUserService.findByUserId(comment.createdBy)?.username
            ?: "[deleted]"
        var lastModifiedByUser: String = createdByUser
        if (comment.createdBy != comment.lastModifiedBy) {
            lastModifiedByUser = tsrUserService.findByUserId(comment.lastModifiedBy)?.username
                ?: "[deleted]"
        }
        return EventTaskCommentDTO(
            eventTaskId = eventTaskId,
            comment = comment,
            createdByDisplayName = createdByUser,
            lastModifiedByDisplayName = lastModifiedByUser
        )
    }

    fun getEventTaskDTOs(eventId: Int): List<EventTaskDTO> {
        val eventTasks = getEventTasks(eventId)
        // TODO so expensive to make a DTO!! Find a better way...
        return eventTasks.map { task ->
            val comments: List<EventTaskCommentDTO> = task.comments.map { comment -> getCommentDisplayNames(task.eventTaskId, comment) }
            task.toEventTaskDTO(comments)
        }
    }

    fun getEventTasks(eventId: Int): List<EventTask> {
        val event = eventService.getEventById(eventId)
        return eventTaskRepository.findAllByEventId(event)
    }

    @Transactional
    fun addComment(eventId: Int, comment: EventTaskCommentDTO): EventTaskCommentDTO {
        val savedComment = eventTaskCommentRepository.saveAndFlush(comment.toComment())
        val savedCommentDTO = getCommentDisplayNames(comment.eventTaskId, savedComment)
        applicationEventPublisher.publishEvent(NewEventTaskCommentEvent(this, eventId, savedCommentDTO))
        return savedCommentDTO
    }

}
