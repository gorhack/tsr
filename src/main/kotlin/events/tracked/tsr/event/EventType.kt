package events.tracked.tsr.event

import javax.persistence.*

@Entity
@Table(name = "event_type")
data class EventType(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var eventTypeId: Long = 0,
        var eventName: String = "",
        var displayName: String = "",
        var sortOrder: Int = 0
)