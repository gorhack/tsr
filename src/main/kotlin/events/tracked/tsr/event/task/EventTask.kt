package events.tracked.tsr.event.task

import events.tracked.tsr.event.Event
import events.tracked.tsr.jpa_ext.Auditable
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserDTO
import java.time.OffsetDateTime
import javax.persistence.*

@Entity
@Table(name = "event_task_category")
data class EventTaskCategory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val eventTaskCategoryId: Long = 0,
    val eventTaskName: String = "",
    val eventTaskDisplayName: String = ""
)

enum class EventTaskStatusCode {
    R,
    Y,
    G
}

@Entity
@Table(name = "event_task_status")
data class EventTaskStatus(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val statusId: Long = 0L,
    val statusName: String = "",
    val statusDisplayName: String = "",
    @Column(columnDefinition = "CHAR(1)")
    @Enumerated(EnumType.STRING)
    val statusShortName: EventTaskStatusCode = EventTaskStatusCode.R,
    val sortOrder: Int = 0
)

@Entity
@Table(name = "event_task")
data class EventTask(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val eventTaskId: Long = 0L,
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.MERGE, CascadeType.REMOVE])
    @JoinColumn(name = "event_task_category_id")
    var eventTaskCategoryId: EventTaskCategory = EventTaskCategory(),
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.MERGE, CascadeType.REMOVE])
    @JoinColumn(name = "event_id")
    var eventId: Event = Event(),
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var suspenseDate: OffsetDateTime = OffsetDateTime.parse("1970-01-01T00:00:01-00:00"),
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.MERGE])
    @JoinColumn(name = "approver_id", referencedColumnName = "id")
    var approver: TsrUser = TsrUser(),
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.MERGE])
    @JoinColumn(name = "resourcer_id", referencedColumnName = "id")
    var resourcer: TsrUser = TsrUser(),
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.MERGE])
    @JoinColumn(name = "status_id")
    var status: EventTaskStatus = EventTaskStatus(statusId = 1L, "CREATED", "created", EventTaskStatusCode.R, 2),
    @OneToMany(mappedBy = "commentId", fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
    var comments: Set<EventTaskComment> = emptySet()

) : Auditable() {
    constructor(eventTaskId: Long, eventTaskCategoryId: EventTaskCategory, eventId: Event, suspenseDate: OffsetDateTime, approver: TsrUser, resourcer: TsrUser, status: EventTaskStatus, comments: Set<EventTaskComment>, lastModifiedDate: OffsetDateTime, lastModifiedBy: String, createdDate: OffsetDateTime, createdBy: String) :
        this(eventTaskId = eventTaskId, eventTaskCategoryId = eventTaskCategoryId, eventId = eventId, suspenseDate = suspenseDate, approver = approver, resourcer = resourcer, status = status, comments = comments) {
        this.lastModifiedDate = lastModifiedDate
        this.lastModifiedBy = lastModifiedBy
        this.createdDate = createdDate
        this.createdBy = createdBy
    }


    fun toEventTaskDTO(commentDTOs: List<EventTaskCommentDTO>): EventTaskDTO {
        return EventTaskDTO(
            eventTaskCategory = this.eventTaskCategoryId,
            eventId = this.eventId.eventId,
            suspenseDate = this.suspenseDate,
            approver = TsrUserDTO(this.approver),
            resourcer = TsrUserDTO(this.resourcer),
            status = this.status,
            comments = commentDTOs
        )
    }
}