package events.tracked.tsr.event

import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(value = ["/api/v1/event"])
class EventController(private val eventService: EventService) {
    @PostMapping(value = [""])
    fun saveEvent(@RequestBody eventDTO: EventDTO): EventDTO {
        return eventService.saveEvent(eventDTO)
    }
    @GetMapping(value = [""])
    fun getAllEvents(): List<EventDTO> {
        return eventService.getAllEvents()
    }

    @GetMapping(value = ["/types"])
    fun allEventTypes(): List<EventType>? {
        return eventService.getAllEventTypes();
    }
}