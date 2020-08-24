package events.tracked.tsr.event

import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/v1/event"])
class EventController(private val eventService: EventService) {
    @PostMapping(value = [""])
    fun saveEvent(@RequestBody eventDTO: EventDTO): EventDTO {
        return eventService.saveEvent(eventDTO)
    }
}