package events.tracked.tsr.event

import events.tracked.tsr.PageDTO
import org.springframework.data.domain.Page
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(value = ["/api/v1/event"])
class EventController(private val eventService: EventService) {
    val availableSortBy = setOf("createdBy", "lastModifiedDate", "startDate", "endDate")

    @PostMapping(value = [""])
    fun saveEvent(@RequestBody eventDTO: EventDTO): EventDTO {
        return eventService.saveEvent(eventDTO)
    }

    @GetMapping(value = [""])
    fun getAllEvents(@RequestParam("page", defaultValue = "0") page: Int,
                     @RequestParam("size", defaultValue = "10") size: Int,
                     @RequestParam("sortBy", defaultValue = "startDate") sortBy: String
    ): ResponseEntity<PageDTO<EventDTO>> {
        if (!availableSortBy.contains(sortBy)) {
            return ResponseEntity(PageDTO(Page.empty()), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
        val allEvents = eventService.getAllEvents(page, size, sortBy)
        return ResponseEntity<PageDTO<EventDTO>>(allEvents, HttpHeaders(), HttpStatus.OK)
    }

    @GetMapping(value = ["/types"])
    fun allEventTypes(): List<EventType>? {
        return eventService.getAllEventTypes();
    }

    @GetMapping(value = ["/{eventId}"])
    fun getEventById(@PathVariable eventId: Int): EventDTO {
        return eventService.getEventById(eventId)
    }

    @GetMapping(value = ["/user/{userId}"])
    fun getEventsByUserId(@PathVariable userId: String): List<EventDTO> {
        return eventService.getEventsByUserId(userId)
    }
}