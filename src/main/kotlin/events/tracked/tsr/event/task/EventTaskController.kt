package events.tracked.tsr.event.task

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(value = ["/api/v1/event/{eventId}/task"])
class EventTaskController(
    private val eventTaskService: EventTaskService
) {
    @PostMapping(value = [""])
    fun createEventTask(
        @AuthenticationPrincipal oidcUser: OidcUser,
        @PathVariable eventId: Int,
        @RequestBody taskToCreate: EventTaskCategory
    ): ResponseEntity<EventTaskDTO> {
        val eventTask = eventTaskService.createEventTask(oidcUser, eventId, taskToCreate)
        return ResponseEntity(eventTask.toEventTaskDTO(), HttpStatus.CREATED)
    }

    @GetMapping(value = [""])
    fun getEventTasks(@PathVariable eventId: Int): ResponseEntity<List<EventTaskDTO>> {
        val eventTasks = eventTaskService.getEventTasks(eventId)
        return ResponseEntity(eventTasks.map { eventTask -> eventTask.toEventTaskDTO() }, HttpStatus.OK)
    }

}
