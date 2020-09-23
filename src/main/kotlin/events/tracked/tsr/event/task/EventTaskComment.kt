package events.tracked.tsr.event.task

import events.tracked.tsr.event.AuditDTO
import events.tracked.tsr.jpa_ext.Auditable
import java.time.OffsetDateTime
import javax.persistence.*

@Entity
@Table(name = "event_task_comment")
data class EventTaskComment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val commentId: Long = 0L,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_task_id", nullable = false)
    private val eventTask: EventTask,
    @Column(columnDefinition = "TEXT")
    var annotation: String = ""
) : Auditable() {
    constructor(commentId: Long, eventTask: EventTask, annotation: String, lastModifiedDate: OffsetDateTime, lastModifiedBy: String, createdDate: OffsetDateTime, createdBy: String)
        : this(
        commentId = commentId,
        eventTask = EventTask(eventTaskId = eventTask.eventTaskId),
        annotation = annotation
    ) {
        this.createdBy = createdBy
        this.createdDate = createdDate
        this.lastModifiedBy = lastModifiedBy
        this.lastModifiedDate = lastModifiedDate
    }
}

data class EventTaskCommentDTO(
    var eventTaskId: Long = 0L,
    var annotation: String = "",
    var audit: AuditDTO? = null
) {
    constructor(eventTaskId: Long, comment: EventTaskComment, createdByDisplayName: String, lastModifiedByDisplayName: String) : this(
        eventTaskId = eventTaskId,
        annotation = comment.annotation,
        audit = AuditDTO(
            createdBy = comment.createdBy,
            createdDate = comment.createdDate!!,
            createdByDisplayName = createdByDisplayName,
            lastModifiedBy = comment.lastModifiedBy,
            lastModifiedDate = comment.lastModifiedDate!!,
            lastModifiedByDisplayName = lastModifiedByDisplayName
        )
    )

    fun toComment(): EventTaskComment {
        return EventTaskComment(
            eventTask = EventTask(eventTaskId = this.eventTaskId),
            annotation = this.annotation
        )
    }
}

