package events.tracked.tsr.event.type

import javax.persistence.*

@Entity
@Table(name = "event_type")
data class EventType(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var eventTypeId: Long = 0,
        var eventTypeName: String = "",
        var displayName: String = "",
        var sortOrder: Int = 0
)