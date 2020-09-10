package events.tracked.tsr.event.type

import events.tracked.tsr.jpa_ext.Auditable
import java.time.OffsetDateTime
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
) : Auditable() {
    constructor(eventTypeId: Long, eventTypeName: String, displayName: String, sortOrder: Int, lastModifiedDate: OffsetDateTime, lastModifiedBy: String, createdDate: OffsetDateTime, createdBy: String) :
        this(eventTypeId = eventTypeId, eventTypeName = eventTypeName, displayName = displayName, sortOrder = sortOrder) {
        this.lastModifiedDate = lastModifiedDate
        this.lastModifiedBy = lastModifiedBy
        this.createdDate = createdDate
        this.createdBy = createdBy
    }

    fun toEventTypeDTO(): EventTypeDTO {
        return EventTypeDTO(this)
    }
}