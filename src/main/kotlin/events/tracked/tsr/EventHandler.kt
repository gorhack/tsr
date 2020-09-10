package events.tracked.tsr

import events.tracked.tsr.event.Event
import org.springframework.context.ApplicationEvent
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionalEventListener

@Component
class EventHandler(private val websocket: SimpMessagingTemplate) {
    @Async
    @TransactionalEventListener
    fun newTsrEventSaveEvent(event: Event) {
        val orgId = event.organization.organizationId
        val dto = event.toEventDTO()
        // TODO map over all event organzations and convertAndSend to each org
        websocket.convertAndSend("/topic/newEvent/${orgId}", dto)
    }
}

class NewTsrEventSaveEvent(source: Any, val event: Event)
    : ApplicationEvent(source)