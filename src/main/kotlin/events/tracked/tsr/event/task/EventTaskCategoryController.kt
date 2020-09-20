package events.tracked.tsr.event.task

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
@RequestMapping(value = ["/api/v1/event/task/category"])
class EventTaskCategoryController(
    val eventTaskCategoryService: EventTaskCategoryService
) {
    @GetMapping(value = ["/search"])
    fun getEventTaskCategories(
        @RequestParam("searchTerm", defaultValue = "") searchTerm: String,
        @RequestParam("page", defaultValue = "0") page: Int,
        @RequestParam("size", defaultValue = "10") size: Int,
        @RequestParam("sortBy", defaultValue = "eventTaskCategoryId") sortBy: String
    ): ResponseEntity<PageDTO<EventTaskCategory>> {
        return when (sortBy) {
            "eventTaskCategoryId" -> ResponseEntity<PageDTO<EventTaskCategory>>(
                eventTaskCategoryService.getEventTaskCategories(searchTerm, page, size, Sort.by(sortBy)),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }

}
