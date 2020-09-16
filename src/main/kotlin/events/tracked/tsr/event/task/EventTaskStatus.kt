package events.tracked.tsr.event.task

import javax.persistence.*

@Entity
@Table(name = "event_task_status")
data class EventTaskStatus(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val statusId: Long = 0,
    val statusName: String = "",
    val statusDisplayName: String = "",
    val statusShortName: Char = ' '
)
