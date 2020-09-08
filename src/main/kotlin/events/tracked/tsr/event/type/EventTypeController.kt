package events.tracked.tsr.event.type

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/v1/event/type"])
class EventTypeController(
    private val eventTypeService: EventTypeService
) {
    @GetMapping(value = [""])
    fun allEventTypes(): List<EventType>? {
        return eventTypeService.getAllEventTypes()
    }
}