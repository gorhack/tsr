package events.tracked.tsr.event

import events.tracked.tsr.PageDTO
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping(value = ["/api/v1/event"])
class EventController(private val eventService: EventService) {
    @PostMapping(value = [""])
    fun saveEvent(@RequestBody eventDTO: EventDTO): EventDTO {
        return eventService.saveEvent(eventDTO)
    }

    @GetMapping(value = [""])
    fun getAllEvents(@RequestParam("page", defaultValue = "0") page: Int,
                     @RequestParam("size", defaultValue = "10") size: Int,
                     @RequestParam("sortBy", defaultValue = "startDate") sortBy: String,
                     @RequestParam("localDate") localDate: String
    ): ResponseEntity<PageDTO<EventDTO>> {
        return when (sortBy) {
            "startDate" -> ResponseEntity<PageDTO<EventDTO>>(
                eventService.getAllEventsEndingAfterToday(page, size, Sort.by(sortBy).and(Sort.by("endDate")), localDate),
                HttpHeaders(),
                HttpStatus.OK
            )
            "endDate" -> ResponseEntity<PageDTO<EventDTO>>(
                eventService.getAllEventsEndingAfterToday(page, size, Sort.by(sortBy).and(Sort.by("startDate")), localDate),
                HttpHeaders(),
                HttpStatus.OK
            )
            "createdDate", "lastModifiedDate" -> ResponseEntity<PageDTO<EventDTO>>(
                eventService.getAllEvents(page, size, Sort.by(sortBy)),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(Page.empty()), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }

    @GetMapping(value = ["/types"])
    fun allEventTypes(): List<EventType>? {
        return eventService.getAllEventTypes()
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