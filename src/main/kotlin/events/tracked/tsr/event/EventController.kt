package events.tracked.tsr.event

import events.tracked.tsr.PageDTO
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(value = ["/api/v1/event"])
class EventController(
    private val eventService: EventService
) {
    @PostMapping(value = [""])
    fun saveEvent(@RequestBody eventDTO: EventDTO): EventDTO {
        return eventService.saveEvent(eventDTO)
    }

    @GetMapping(value = ["/active"])
    fun getActiveEvents(@RequestParam("page", defaultValue = "0") page: Int,
                        @RequestParam("size", defaultValue = "10") size: Int,
                        @RequestParam("sortBy", defaultValue = "startDate") sortBy: String
    ): ResponseEntity<PageDTO<EventDTO>> {
        return when (sortBy) {
            "startDate" -> ResponseEntity<PageDTO<EventDTO>>(
                eventService.getActiveEvents(page, size, Sort.by(sortBy).and(Sort.by("endDate"))),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }

    @GetMapping(value = ["/active/user/{userId}"])
    fun getActiveEventsByUserId(@PathVariable userId: String,
                                @RequestParam("page", defaultValue = "0") page: Int,
                                @RequestParam("size", defaultValue = "10") size: Int,
                                @RequestParam("sortBy", defaultValue = "startDate") sortBy: String
    ): ResponseEntity<PageDTO<EventDTO>> {
        return when (sortBy) {
            "startDate" -> ResponseEntity<PageDTO<EventDTO>>(
                eventService.getActiveEventsByUserId(userId, page, size, Sort.by(sortBy).and(Sort.by("endDate"))),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }

    @GetMapping(value = ["/{eventId}"])
    fun getEventById(@PathVariable eventId: Int): EventDTO {
        return eventService.getEventById(eventId)
    }
}