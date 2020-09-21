package events.tracked.tsr.event

import events.tracked.tsr.PageDTO
import events.tracked.tsr.user.TsrUserService
import events.tracked.tsr.user.userId
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(value = ["/api/v1/event"])
class EventController(
    private val eventService: EventService,
    private val tsrUserService: TsrUserService
) {
    @PostMapping(value = [""])
    fun saveEvent(@RequestBody eventDTO: EventDTO): EventDTO {
        // TODO return ResponseEntity
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

    @GetMapping(value = ["/active/user"])
    fun getActiveEventsByUserId(@AuthenticationPrincipal user: OidcUser,
                                @RequestParam("page", defaultValue = "0") page: Int,
                                @RequestParam("size", defaultValue = "10") size: Int,
                                @RequestParam("sortBy", defaultValue = "startDate") sortBy: String
    ): ResponseEntity<PageDTO<EventDTO>> {
        tsrUserService.assertUserExistsAndReturnUser(user)

        return when (sortBy) {
            "startDate" -> ResponseEntity<PageDTO<EventDTO>>(
                eventService.getActiveEventsByUserId(
                    user.userId,
                    page, size,
                    Sort.by(sortBy).and(Sort.by("endDate"))
                ),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }

    @GetMapping(value = ["/active/organizations"])
    fun getActiveEventsByOrganizationIds(
        @AuthenticationPrincipal user: OidcUser,
        @RequestParam("page", defaultValue = "0") page: Int,
        @RequestParam("size", defaultValue = "10") size: Int,
        @RequestParam("sortBy", defaultValue = "startDate") sortBy: String
    ): ResponseEntity<PageDTO<EventDTO>> {
        val tsrUser = tsrUserService.assertUserExistsAndReturnUser(user);
        return when (sortBy) {
            "startDate" -> ResponseEntity<PageDTO<EventDTO>>(
                eventService.getActiveEventsByOrganizationIds(
                    tsrUser.organizations,
                    page,
                    size,
                    Sort.by(sortBy).and(Sort.by("endDate"))
                ),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }

    @GetMapping(value = ["/{eventId}"])
    fun getEventById(@PathVariable eventId: Int): EventDTO {
        return eventService.getEventDTOById(eventId)
    }
}