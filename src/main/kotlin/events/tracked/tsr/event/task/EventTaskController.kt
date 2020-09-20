package events.tracked.tsr.event.task

import events.tracked.tsr.user.TsrUserService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/v1/event/task"])
class EventTaskController(
    private val eventTaskService: EventTaskService,
    private val tsrUserService: TsrUserService
) {
    @PostMapping(value = [""])
    fun createEventTask(
        @AuthenticationPrincipal oidcUser: OidcUser,
        @RequestBody taskToCreate: CreateEventTaskDTO
    ): ResponseEntity<EventTaskDTO> {
        val tsrUser = tsrUserService.assertUserExistsAndReturnUser(oidcUser)
        return eventTaskService.createEventTask(tsrUser, taskToCreate)
    }

}
