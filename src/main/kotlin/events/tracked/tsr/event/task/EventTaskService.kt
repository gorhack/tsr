package events.tracked.tsr.event.task

import events.tracked.tsr.NewTsrEventTaskSaveEvent
import events.tracked.tsr.event.EventRepository
import events.tracked.tsr.user.TsrUser
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import javax.persistence.EntityNotFoundException

@Service
class EventTaskService(
    private val eventTaskRepository: EventTaskRepository,
    private val eventRepository: EventRepository,
    private val applicationEventPublisher: ApplicationEventPublisher
){
    fun createEventTask(tsrUser: TsrUser, taskToCreate: CreateEventTaskDTO): ResponseEntity<EventTaskDTO> {
        val event = eventRepository.findByIdOrNull(taskToCreate.eventId) ?: throw EntityNotFoundException("event not found")
        val eventTaskToSave = EventTask(
            eventTaskCategoryId = taskToCreate.eventTaskCategory,
            eventId = event,
            suspenseDate = event.startDate,
            approver = tsrUser,
            resourcer = tsrUser
        )
        val eventTask = eventTaskRepository.saveAndFlush(eventTaskToSave)
        applicationEventPublisher.publishEvent(NewTsrEventTaskSaveEvent(this, eventTask))
        return ResponseEntity(eventTask.toEventTaskDTO(), HttpStatus.CREATED)
    }

}
