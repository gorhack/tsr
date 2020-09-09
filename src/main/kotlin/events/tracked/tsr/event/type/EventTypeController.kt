package events.tracked.tsr.event.type

import events.tracked.tsr.PageDTO
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

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
}