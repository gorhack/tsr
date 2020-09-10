package events.tracked.tsr.event.type

import events.tracked.tsr.jpa_ext.Auditable
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
) : Auditable()
//{
//        constructor(eventTypeId: Long, yeventTypeName: String, displayName: String, sortOrder: Int) :
//            this(eventTypeId = eventTypeId, eventTypeName = eventTypeName, displayName = displayName, sortOrder = sortOrder)
//}