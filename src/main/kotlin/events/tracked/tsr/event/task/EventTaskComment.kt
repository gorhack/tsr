package events.tracked.tsr.event.task

import events.tracked.tsr.jpa_ext.Auditable
import javax.persistence.*

@Entity
@Table(name = "event_task_comment")
data class EventTaskComment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val commentId: Long = 0L,
    @ManyToOne(fetch = FetchType.LAZY, cascade = [CascadeType.MERGE, CascadeType.REMOVE])
    @JoinColumn(name = "event_task_id", nullable = false)
    val eventTask: EventTask,
    @Column(columnDefinition = "TEXT")
    var annotation: String = ""
) : Auditable()