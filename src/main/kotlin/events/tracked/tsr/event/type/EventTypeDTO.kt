package events.tracked.tsr.event.type

data class EventTypeDTO(
    var eventTypeId: Long = 0,
    var eventTypeName: String = "",
    var displayName: String = "",
    var sortOrder: Int = 0
) {
    constructor(eventType: EventType) : this(
        eventTypeId = eventType.eventTypeId, eventTypeName = eventType.eventTypeName, displayName = eventType.displayName, sortOrder = eventType.sortOrder
    )

    private fun copyInto(eventType: EventType): EventType {
        val eventTypeCopy = eventType.copy(
            eventTypeName = this.eventTypeName,
            displayName = this.displayName
        )
        eventTypeCopy.lastModifiedDate = eventType.lastModifiedDate
        eventTypeCopy.lastModifiedBy = eventType.lastModifiedBy
        eventTypeCopy.createdDate = eventType.createdDate
        eventTypeCopy.createdBy = eventType.createdBy
        return eventTypeCopy
    }

    fun toEventType(): EventType {
        return copyInto(EventType())
    }
}