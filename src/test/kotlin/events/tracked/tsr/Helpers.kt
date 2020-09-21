package events.tracked.tsr

import events.tracked.tsr.event.*
import events.tracked.tsr.event.task.EventTask
import events.tracked.tsr.event.task.EventTaskCategory
import events.tracked.tsr.event.task.EventTaskDTO
import events.tracked.tsr.event.task.EventTaskStatus
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

fun makeEventWithoutId(): Event {
    return Event(
        eventName = "blue",
        organization = makeOrganization1(),
        eventType = EventType(1, "rock", "rocks are fun", 1),
        startDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
        endDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
    )
}

fun makeEventDTOWithoutId(): EventDTO {
    return EventDTO(
        eventName = "blue",
        organization = makeOrganization1(),
        eventType = EventType(1, "rock", "rocks are fun", 1),
        startDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
        endDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
    )
}

fun makeEventWithId(): Event {
    return Event(
        eventId = 1L,
        eventName = "blue",
        organization = makeOrganization1(),
        startDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
        endDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
        eventType = EventType(1, "rock", "rocks are fun", 1),
        lastModifiedBy = "6789",
        lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
        createdBy = "1234",
        createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
    )
}

fun makeEventDTOWithId(): EventDTO {
    return EventDTO(
        eventId = 1L,
        eventName = "blue",
        organization = makeOrganization1(),
        startDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
        endDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
        eventType = EventType(1, "rock", "rocks are fun", 1),
        audit = AuditDTO(
            lastModifiedBy = "6789",
            lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
            createdBy = "1234",
            createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
        )
    )
}

fun makeEventWithId2(): Event {
    return Event(
        eventId = 2L,
        eventName = "second",
        organization = makeOrganization2(),
        startDate = OffsetDateTime.parse("1970-01-03T00:00:01-08:00"),
        endDate = OffsetDateTime.parse("1970-01-03T00:00:01-08:00"),
        eventType = null,
        lastModifiedBy = "6789",
        lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
        createdBy = "1234",
        createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
    )
}

fun makeEventDTOWithId2(): EventDTO {
    return EventDTO(
        eventId = 2L,
        eventName = "second",
        startDate = OffsetDateTime.parse("1970-01-03T00:00:01-08:00"),
        endDate = OffsetDateTime.parse("1970-01-03T00:00:01-08:00"),
        organization = makeOrganization2(),
        eventType = null,
        audit = AuditDTO(
            lastModifiedBy = "6789",
            lastModifiedDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00"),
            createdBy = "1234",
            createdDate = OffsetDateTime.parse("1970-01-02T00:00:01-08:00")
        )
    )
}

fun makeEventTask(): EventTask {
    return EventTask(
        eventId = makeEventWithId(),
        eventTaskCategoryId = EventTaskCategory(eventTaskCategoryId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I"),
        suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
        resourcer = TsrUser(1L, "1234", "user", UserRole.USER),
        approver = TsrUser(1L, "1234", "user", UserRole.USER),
        status = EventTaskStatus(1L, "CREATED", "created", 'R')
    )
}

fun makeEventTask2(): EventTask {
    return EventTask(
        eventId = makeEventWithId(),
        eventTaskCategoryId = EventTaskCategory(eventTaskCategoryId = 4L, eventTaskName = "CLASS_FOUR", eventTaskDisplayName = "Class IV"),
        suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
        resourcer = TsrUser(1L, "1234", "user", UserRole.USER),
        approver = TsrUser(1L, "1234", "user", UserRole.USER),
        status = EventTaskStatus(1L, "CREATED", "created", 'R')
    )
}

fun makeEventTaskDTO(): EventTaskDTO {
    return EventTaskDTO(
        eventId = 1L,
        eventTaskCategory = EventTaskCategory(eventTaskCategoryId = 10L, eventTaskName = "CLASS_ONE", eventTaskDisplayName = "Class I"),
        suspenseDate = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
        resourcer = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
        approver = TsrUserDTO(1L, "1234", "user", UserRole.USER, UserSettingsDTO()),
        status = EventTaskStatus(1L, "CREATED", "created", 'R')
    )
}