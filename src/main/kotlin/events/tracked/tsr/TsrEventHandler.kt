package events.tracked.tsr

import events.tracked.tsr.event.Event
import events.tracked.tsr.event.task.EventTask
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
        val dto = transactionalEvent.event.toEventDTOWithDisplayNames()
        transactionalEvent.event.organizations.map { org ->
            websocket.convertAndSend("/topic/updateEvent/${org.organizationId}", dto)
        }
    }

    @Async
    @TransactionalEventListener
    fun updateTsrEventSaveEvent(transactionalEvent: UpdateTsrEventSaveEvent) {
        val dto = transactionalEvent.event.toEventDTOWithDisplayNames()
        transactionalEvent.event.organizations.map { org ->
            websocket.convertAndSend("/topic/updateEvent/${org.organizationId}", dto)
        }
    }

    @Async
    @TransactionalEventListener
    fun newTsrEventTaskSaveEvent(transactionalEventTask: NewTsrEventTaskSaveEvent) {
        val eventId = transactionalEventTask.eventTask.eventId.eventId
        val dto = transactionalEventTask.eventTask.toEventTaskDTO()
        websocket.convertAndSend("/topic/newEventTask/${eventId}", dto)
    }
}

class NewTsrEventSaveEvent(source: Any, val event: Event)
    : ApplicationEvent(source)

class UpdateTsrEventSaveEvent(source: Any, val event: Event)
    : ApplicationEvent(source)

class NewTsrEventTaskSaveEvent(source: Any, val eventTask: EventTask): ApplicationEvent(source)