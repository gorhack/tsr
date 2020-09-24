package events.tracked.tsr.event.task

import events.tracked.tsr.event.AuditDTO
import events.tracked.tsr.jpa_ext.Auditable
import java.time.OffsetDateTime
import java.util.*
import javax.persistence.*

@Entity
@Table(name = "event_task_comment")
data class EventTaskComment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val commentId: Long = 0L,
    @ManyToOne(targetEntity = EventTask::class, fetch = FetchType.LAZY)
    @JoinColumn(name = "event_task_id", nullable = false)
    private var eventTask: EventTask,
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

    fun updateEventTask(eventTask: EventTask) {
        this.eventTask = eventTask
    }

    // https://medium.com/@rajibrath20/the-best-way-to-map-a-onetomany-relationship-with-jpa-and-hibernate-dbbf6dba00d3
    @Override
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is EventTaskComment) return false
        return commentId == other.commentId
    }

    @Override
    override fun hashCode(): Int {
        return Objects.hash(this.commentId)
    }
}

data class EventTaskCommentDTO(
    val commentId: Long,
    var eventTaskId: Long = 0L,
    var annotation: String = "",
    var audit: AuditDTO? = null
) {
    constructor(eventTaskId: Long, comment: EventTaskComment, createdByDisplayName: String, lastModifiedByDisplayName: String) : this(
        commentId = comment.commentId,
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

    fun toComment(eventTask: EventTask): EventTaskComment {
        return EventTaskComment(
            commentId = this.commentId,
            eventTask = eventTask,
            annotation = this.annotation
        )
    }
}

