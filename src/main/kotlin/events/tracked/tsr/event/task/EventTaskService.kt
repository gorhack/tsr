package events.tracked.tsr.event.task

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
    private val tsrUserService: TsrUserService,
    private val eventService: EventService,
    private val applicationEventPublisher: ApplicationEventPublisher
){
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

    fun getEventTasks(eventId: Int): List<EventTask> {
        val event = eventService.getEventById(eventId)
        return eventTaskRepository.findAllByEventId(event)
    }

}
