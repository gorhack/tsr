package events.tracked.tsr.event.type

import events.tracked.tsr.PageDTO
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(value = ["/api/v1/event/type"])
class EventTypeController(
    private val eventTypeService: EventTypeService
) {
    @GetMapping(value = [""])
    fun allEventTypes(@RequestParam("page", defaultValue = "0") page: Int,
                      @RequestParam("size", defaultValue = "10") size: Int,
                      @RequestParam("sortBy", defaultValue = "sortOrder") sortBy: String
    ): ResponseEntity<PageDTO<EventType>> {
        return when (sortBy) {
            "sortOrder" -> ResponseEntity<PageDTO<EventType>>(
                eventTypeService.getAllEventTypes(page, size, Sort.by(sortBy)),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }

    @GetMapping(value = ["/search"])
    fun getEventTypeContains(
        @RequestParam("searchTerm", defaultValue = "") searchTerm: String,
        @RequestParam("page", defaultValue = "0") page: Int,
        @RequestParam("size", defaultValue = "1") size: Int,
        @RequestParam("sortBy", defaultValue = "sortOrder") sortBy: String
    ): ResponseEntity<PageDTO<EventType>> {
        return when (sortBy) {
            "sortOrder" -> ResponseEntity<PageDTO<EventType>>(
                eventTypeService.getEventTypeContains(searchTerm, page, size, Sort.by(sortBy)),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }

    @PostMapping(value = [""])
    fun createEventType(
        @RequestBody eventType: EventTypeDTO
    ): ResponseEntity<EventTypeDTO> {
        return ResponseEntity<EventTypeDTO>(eventTypeService.createEventType(eventType), HttpHeaders(), HttpStatus.CREATED)
    }
}