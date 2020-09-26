package events.tracked.tsr.event.task

import events.tracked.tsr.NewEventTaskCommentEvent
import events.tracked.tsr.NewTsrEventTaskSaveEvent
import events.tracked.tsr.event.EventService
import events.tracked.tsr.user.TsrUserService
import org.springframework.context.ApplicationEventPublisher
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.stereotype.Service
import javax.transaction.Transactional

@Service
class EventTaskService(
    private val eventTaskRepository: EventTaskRepository,
    private val tsrUserService: TsrUserService,
    private val eventService: EventService,
    private val applicationEventPublisher: ApplicationEventPublisher
) {
    @Transactional
    fun createEventTask(oidcUser: OidcUser, eventId: Int, taskToCreate: EventTaskCategory): EventTask {
        val tsrUser = tsrUserService.assertUserExistsAndReturnUser(oidcUser)
        val event = eventService.getEventById(eventId)
        val eventTaskToSave = EventTask(
            eventTaskCategory = taskToCreate,
            event = event,
            suspenseDate = event.startDate,
            approver = tsrUser,
            resourcer = tsrUser
        )
        val eventTask = eventTaskRepository.saveAndFlush(eventTaskToSave)
        applicationEventPublisher.publishEvent(NewTsrEventTaskSaveEvent(this, eventTask))
        return eventTask
    }

    fun getCommentDisplayNames(eventTaskId: Long, comment: EventTaskComment, userIdToUsername: HashMap<String, String>): EventTaskCommentDTO {
        val createdByUser = if (userIdToUsername.containsKey(comment.createdBy)) {
            userIdToUsername[comment.createdBy]!!
        } else {
            tsrUserService.findByUserId(comment.createdBy)?.username
                ?: "[deleted]"
        }
        var lastModifiedByUser = createdByUser
        if (comment.createdBy != comment.lastModifiedBy) {
            lastModifiedByUser = if (userIdToUsername.containsKey(comment.lastModifiedBy)) {
                userIdToUsername[comment.lastModifiedBy]!!
            } else {
                tsrUserService.findByUserId(comment.lastModifiedBy)?.username
                    ?: "[deleted]"
            }
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
        val userIdToUsername = HashMap<String, String>()
        // TODO so expensive to make a DTO!! Find a better way...
        // use hash map to reduce, only get comments when task is opened by user?
        return eventTasks.map { task ->
            val comments: List<EventTaskCommentDTO> = task.comments.map { comment ->
                val commentDTO = getCommentDisplayNames(
                    eventTaskId = task.eventTaskId,
                    comment = comment,
                    userIdToUsername = userIdToUsername
                )
                userIdToUsername[commentDTO.audit!!.createdBy] = commentDTO.audit!!.createdByDisplayName!!
                userIdToUsername[commentDTO.audit!!.lastModifiedBy] = commentDTO.audit!!.lastModifiedByDisplayName!!
                commentDTO
            }
            task.toEventTaskDTO(comments)
        }
    }

    fun getEventTasks(eventId: Int): List<EventTask> {
        return eventTaskRepository.findAllByEventEventId(eventId.toLong())
    }

    @Transactional
    fun addComment(eventId: Int, eventTaskId: Int, commentDTO: EventTaskCommentDTO): EventTaskCommentDTO {
        val eventTask = eventTaskRepository.findByIdOrNull(eventTaskId.toLong())
            ?: throw EmptyResultDataAccessException(1)
        val comment = commentDTO.toComment(eventTask)
        eventTask.addComment(comment)
        val savedEventTask = eventTaskRepository.saveAndFlush(eventTask)
        val commentWithDisplayNames = getCommentDisplayNames(
            eventTaskId = eventTask.eventTaskId,
            comment = savedEventTask.comments.last(),
            userIdToUsername = hashMapOf()
        )
        applicationEventPublisher.publishEvent(NewEventTaskCommentEvent(this, eventId, commentWithDisplayNames))
        return commentWithDisplayNames
    }

}
