package events.tracked.tsr.event.task

import events.tracked.tsr.NewTsrEventTaskSaveEvent
import events.tracked.tsr.event.Event
import events.tracked.tsr.event.EventService
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserService
import org.springframework.context.ApplicationEventPublisher
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.stereotype.Service

@Service
class EventTaskService(
    private val eventTaskRepository: EventTaskRepository,
    private val tsrUserService: TsrUserService,
    private val eventService: EventService,
    private val applicationEventPublisher: ApplicationEventPublisher
){
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

    fun getEventTasks(eventId: Int): List<EventTask> {
        val event = eventService.getEventById(eventId)
        return eventTaskRepository.findAllByEventId(event)
    }

}
