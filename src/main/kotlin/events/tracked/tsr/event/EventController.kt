package events.tracked.tsr.event

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/api/v1/event")
class EventController(private val eventService: EventService) {
    @PostMapping
    fun saveEvent(eventDTO: EventDTO): EventDTO {
        return eventService.saveEvent(eventDTO)
    }
}