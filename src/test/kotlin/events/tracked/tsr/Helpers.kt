package events.tracked.tsr

import events.tracked.tsr.event.*
import events.tracked.tsr.event.task.*
import events.tracked.tsr.event.type.EventType
import events.tracked.tsr.organization.Organization
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserDTO
import events.tracked.tsr.user.UserRole
import events.tracked.tsr.user.UserSettingsDTO
import io.mockk.every
import io.mockk.mockk
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames
import org.springframework.security.oauth2.core.oidc.OidcIdToken
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import java.time.Instant
import java.time.OffsetDateTime
import java.util.*

fun makeOidcUser(userId: String, userName: String): OidcUser {
    val claims = mutableMapOf<String, Any>(
        "user_name" to userName,
        "sub" to userId
    )
    val mockOidcUser = mockk<OidcUser>()
    every { mockOidcUser.attributes } returns claims
    return mockOidcUser
}

fun makeIdToken(claims: MutableMap<String, Any> = mutableMapOf()): OidcIdToken {
    claims.putIfAbsent(IdTokenClaimNames.SUB, UUID.randomUUID().toString())

    return OidcIdToken("id-token", Instant.now(), Instant.now().plusSeconds(3600), claims)
}

fun makeOrganization1(): Organization {
    return Organization(
        organizationId = 1L,
        organizationName = "org1",
        organizationDisplayName = "org 1",
        sortOrder = 1
    )
}

fun makeOrganization2(): Organization {
    return Organization(
        organizationId = 2L,
        organizationName = "org2",
        organizationDisplayName = "org 2",
        sortOrder = 2
    )
}

val janFirstDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00")
val janSecondDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")

fun makeEventWithoutId(): Event {
    return Event(
        eventName = "blue",
        organizations = mutableListOf(makeOrganization1()),
        eventType = EventType(1, "rock", "rocks are fun", 1),
        startDate = janFirstDate,
        endDate = janSecondDate
    )
}

fun makeEventDTOWithoutId(): EventDTO {
    return EventDTO(
        eventName = "blue",
        organizations = mutableListOf(makeOrganization1()),
        eventType = EventType(1, "rock", "rocks are fun", 1),
        startDate = janFirstDate,
        endDate = janSecondDate
    )
}

fun makeEventWithId(): Event {
    return Event(
        eventId = 1L,
        eventName = "blue",
        organizations = mutableListOf(makeOrganization1()),
        startDate = janFirstDate,
        endDate = janSecondDate,
        eventType = EventType(1, "rock", "rocks are fun", 1),
        lastModifiedBy = "6789",
        lastModifiedDate = janSecondDate,
        createdBy = "1234",
        createdDate = janSecondDate
    )
}

fun makeEventDTOWithId(): EventDTO {
    return EventDTO(
        eventId = 1L,
        eventName = "blue",
        organizations = mutableListOf(makeOrganization1()),
        startDate = janFirstDate,
        endDate = janSecondDate,
        eventType = EventType(1, "rock", "rocks are fun", 1),
        audit = AuditDTO(
            lastModifiedBy = "6789",
            lastModifiedDate = janSecondDate,
            createdBy = "1234",
            createdDate = janSecondDate
        )
    )
}

fun makeEventWithId2(): Event {
    return Event(
        eventId = 2L,
        eventName = "second",
        organizations = mutableListOf(makeOrganization2()),
        startDate = OffsetDateTime.parse("1970-01-03T00:00:01-08:00"),
        endDate = OffsetDateTime.parse("1970-01-03T00:00:01-08:00"),
        eventType = null,
        lastModifiedBy = "6789",
        lastModifiedDate = janSecondDate,
        createdBy = "1234",
        createdDate = janSecondDate
    )
}

fun makeEventDTOWithId2(): EventDTO {
    return EventDTO(
        eventId = 2L,
        eventName = "second",
        startDate = OffsetDateTime.parse("1970-01-03T00:00:01-08:00"),
        endDate = OffsetDateTime.parse("1970-01-03T00:00:01-08:00"),
        organizations = mutableListOf(makeOrganization2()),
        eventType = null,
        audit = AuditDTO(
            lastModifiedBy = "6789",
            lastModifiedDate = janSecondDate,
            createdBy = "1234",
            createdDate = janSecondDate
        )
    )
}

fun makeEventTask(): EventTask {
    return EventTask(
        eventId = makeEventWithId(),
        eventTaskCategoryId = EventTaskCategory(eventTaskCategoryId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I"),
        suspenseDate = janFirstDate,
        resourcer = TsrUser(1L, "1234", "user", UserRole.USER),
        approver = TsrUser(1L, "1234", "user", UserRole.USER),
    )
}

fun makeEventTask2(): EventTask {
    return EventTask(
        eventTaskId = 2L,
        eventId = makeEventWithId(),
        eventTaskCategoryId = EventTaskCategory(eventTaskCategoryId = 4L, eventTaskName = "CLASS_FOUR", eventTaskDisplayName = "Class IV"),
        suspenseDate = janFirstDate,
        resourcer = TsrUser(1L, "1234", "user", UserRole.USER),
        approver = TsrUser(1L, "1234", "user", UserRole.USER),
        status = EventTaskStatus(),
        comments = setOf(
            EventTaskComment(
                commentId = 1L,
                eventTask = EventTask(eventTaskId = 2L),
                annotation = "first annotation"
            )
        ),
        createdBy = "1234",
        createdDate = janFirstDate,
        lastModifiedBy = "0987",
        lastModifiedDate = janSecondDate
    )
}

fun makeEventTaskDTO(): EventTaskDTO {
    return EventTaskDTO(
        eventId = 1L,
        eventTaskCategory = EventTaskCategory(eventTaskCategoryId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I"),
        suspenseDate = janFirstDate,
        resourcer = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
        approver = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
    )
}