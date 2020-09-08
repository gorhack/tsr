package events.tracked.tsr.event

import events.tracked.tsr.PageDTO
import org.springframework.data.domain.Page
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(value = ["/api/v1/event"])
class EventController(private val eventService: EventService) {
    @PostMapping(value = [""])
    fun saveEvent(@RequestBody eventDTO: EventDTO): EventDTO {
        return eventService.saveEvent(eventDTO)
    }

    @GetMapping(value = [""])
    fun getCurrentAndFutureEventsPage(@RequestParam("page", defaultValue = "0") page: Int,
                                      @RequestParam("size", defaultValue = "10") size: Int,
                                      @RequestParam("sortBy", defaultValue = "startDate") sortBy: String
    ): ResponseEntity<PageDTO<EventDTO>> {
        return when (sortBy) {
            "startDate" -> ResponseEntity<PageDTO<EventDTO>>(
                eventService.getAllEventsEndingAfterToday(page, size, Sort.by(sortBy).and(Sort.by("endDate"))),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }

    @GetMapping(value = ["/organizations"])
    fun allOrgNames(): List<Organization>? {
        return eventService.getAllOrgNames()
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
    fun getAllEventsEndingAfterTodayByUserId(@PathVariable userId: String,
                                             @RequestParam("page", defaultValue = "0") page: Int,
                                             @RequestParam("size", defaultValue = "10") size: Int,
                                             @RequestParam("sortBy", defaultValue = "startDate") sortBy: String
    ): ResponseEntity<PageDTO<EventDTO>> {
        return when (sortBy) {
            "startDate" -> ResponseEntity<PageDTO<EventDTO>>(
                eventService.getAllEventsEndingAfterTodayByUserId(userId, page, size, Sort.by(sortBy).and(Sort.by("endDate"))),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }
}