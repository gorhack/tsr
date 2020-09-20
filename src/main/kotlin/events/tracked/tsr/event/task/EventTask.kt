package events.tracked.tsr.event.task

import events.tracked.tsr.event.Event
import events.tracked.tsr.jpa_ext.Auditable
import events.tracked.tsr.user.TsrUser
import events.tracked.tsr.user.TsrUserDTO
import java.io.Serializable
import java.time.OffsetDateTime
import javax.persistence.*

@Entity
@Table(name = "event_task_category")
data class EventTaskCategory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val eventTaskId: Long = 0,
    val eventTaskName: String = "",
    val eventTaskDisplayName: String = ""
)

class EventTaskKey : Serializable {
    val eventTaskCategoryId: EventTaskCategory = EventTaskCategory()
    val eventId: Event = Event()
}

@Entity
@Table(name = "event_task")
@IdClass(EventTaskKey::class)
data class EventTask(
    @Id
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinColumn(name = "event_task_id")
    val eventTaskCategoryId: EventTaskCategory = EventTaskCategory(),
    @Id
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinColumn(name = "event_id")
    val eventId: Event,
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var suspenseDate: OffsetDateTime = OffsetDateTime.parse("1970-01-01T00:00:01-00:00"),
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinColumn(name = "approver_id", referencedColumnName = "id")
    var approver: TsrUser,
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinColumn(name = "resourcer_id", referencedColumnName = "id")
    var resourcer: TsrUser,
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinColumn(name = "status_id")
    var status: EventTaskStatus = EventTaskStatus(statusId = 1L, "CREATED", "created", 'R')
) : Auditable() {
    constructor(eventTaskCategoryId: EventTaskCategory, eventId: Event, suspenseDate: OffsetDateTime, approver: TsrUser, resourcer: TsrUser, status: EventTaskStatus, lastModifiedDate: OffsetDateTime, lastModifiedBy: String, createdDate: OffsetDateTime, createdBy: String) :
        this(eventTaskCategoryId = eventTaskCategoryId, eventId = eventId, suspenseDate = suspenseDate, approver = approver, resourcer = resourcer, status = status) {
        this.lastModifiedDate = lastModifiedDate
        this.lastModifiedBy = lastModifiedBy
        this.createdDate = createdDate
        this.createdBy = createdBy
    }


    fun toEventTaskDTO(): EventTaskDTO {
        return EventTaskDTO(
            eventTaskCategory = this.eventTaskCategoryId,
            eventId = this.eventId.eventId,
            suspenseDate = this.suspenseDate,
            approver = TsrUserDTO(this.approver),
            resourcer = TsrUserDTO(this.resourcer),
            status = this.status
        )
    }
}