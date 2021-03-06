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
) : Auditable () {
    constructor(eventTaskCategoryId: Long, eventTaskName: String, eventTaskDisplayName: String, lastModifiedDate: OffsetDateTime, lastModifiedBy: String, createdDate: OffsetDateTime, createdBy: String) :
        this(eventTaskCategoryId = eventTaskCategoryId, eventTaskName = eventTaskName, eventTaskDisplayName = eventTaskDisplayName) {
        this.lastModifiedDate = lastModifiedDate
        this.lastModifiedBy = lastModifiedBy
        this.createdDate = createdDate
        this.createdBy = createdBy
    }
}

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
    @Column(columnDefinition = "BPCHAR(1)")
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
    var eventTaskCategory: EventTaskCategory = EventTaskCategory(),
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.MERGE, CascadeType.REMOVE])
    @JoinColumn(name = "event_id")
    var event: Event = Event(),
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var suspenseDate: OffsetDateTime = OffsetDateTime.parse("1970-01-01T00:00:01-00:00"),
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.MERGE])
    @JoinColumn(name = "approver_id")
    var approver: TsrUser = TsrUser(),
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.MERGE])
    @JoinColumn(name = "resourcer_id")
    var resourcer: TsrUser = TsrUser(),
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.MERGE])
    @JoinColumn(name = "status_id")
    var status: EventTaskStatus = EventTaskStatus(statusId = 1L, "CREATED", "created", EventTaskStatusCode.R, 2),
    @OneToMany(targetEntity = EventTaskComment::class, mappedBy = "eventTask", fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
    var comments: MutableSet<EventTaskComment> = hashSetOf()

) : Auditable() {
    // constructor without status
    constructor(eventTaskId: Long, eventTaskCategoryId: EventTaskCategory, eventId: Event, suspenseDate: OffsetDateTime, approver: TsrUser, resourcer: TsrUser, comments: MutableSet<EventTaskComment>, lastModifiedDate: OffsetDateTime, lastModifiedBy: String, createdDate: OffsetDateTime, createdBy: String) :
        this(eventTaskId = eventTaskId, eventTaskCategory = eventTaskCategoryId, event = eventId, suspenseDate = suspenseDate, approver = approver, resourcer = resourcer, comments = comments) {
        this.lastModifiedDate = lastModifiedDate
        this.lastModifiedBy = lastModifiedBy
        this.createdDate = createdDate
        this.createdBy = createdBy
    }

    fun addComment(comment: EventTaskComment) {
        this.comments.add(comment)
        comment.updateEventTask(this)
    }

    fun toEventTaskDTO(commentDTOs: List<EventTaskCommentDTO>): EventTaskDTO {
        return EventTaskDTO(
            eventId = this.event.eventId,
            eventTaskId = this.eventTaskId,
            eventTaskCategory = this.eventTaskCategory,
            suspenseDate = this.suspenseDate,
            approver = TsrUserDTO(this.approver),
            resourcer = TsrUserDTO(this.resourcer),
            status = this.status,
            comments = commentDTOs
        )
    }
}