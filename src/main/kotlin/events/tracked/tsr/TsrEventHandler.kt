package events.tracked.tsr

import events.tracked.tsr.event.Event
import events.tracked.tsr.event.task.EventTask
import events.tracked.tsr.event.task.EventTaskCommentDTO
import org.springframework.context.ApplicationEvent
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionalEventListener

@Component
class TsrEventHandler(private val websocket: SimpMessagingTemplate) {
    @Async
    @TransactionalEventListener
    fun newTsrEventSaveEvent(transactionalEvent: NewTsrEventSaveEvent) {
        val dto = transactionalEvent.event.toEventDTO()
        transactionalEvent.event.organizations.map { org ->
            websocket.convertAndSend("/topic/newEvent/${org.organizationId}", dto)
        }
    }

    @Async
    @TransactionalEventListener
    fun updateTsrEventSaveEvent(transactionalEvent: UpdateTsrEventSaveEvent) {
        val dto = transactionalEvent.event.toEventDTO()
        transactionalEvent.event.organizations.map { org ->
            websocket.convertAndSend("/topic/updateEvent/${org.organizationId}", dto)
        }
    }

    @Async
    @TransactionalEventListener
    fun newTsrEventTaskSaveEvent(transactionalEventTask: NewTsrEventTaskSaveEvent) {
        val eventId = transactionalEventTask.eventTask.event.eventId
        val dto = transactionalEventTask.eventTask.toEventTaskDTO(listOf())
        websocket.convertAndSend("/topic/newEventTask/${eventId}", dto)
    }

    @Async
    @TransactionalEventListener
    fun newCommentTsrEventTaskEvent(transactionalEventTaskComment: NewEventTaskCommentEvent) {
        val eventId = transactionalEventTaskComment.eventId
        val dto = transactionalEventTaskComment.comment
        websocket.convertAndSend("/topic/newTaskComment/${eventId}", dto)
    }
}

class NewTsrEventSaveEvent(source: Any, val event: Event) : ApplicationEvent(source)
class UpdateTsrEventSaveEvent(source: Any, val event: Event) : ApplicationEvent(source)

class NewTsrEventTaskSaveEvent(source: Any, val eventTask: EventTask): ApplicationEvent(source)
class NewEventTaskCommentEvent(source: Any, val eventId: Int, val comment: EventTaskCommentDTO): ApplicationEvent(source)