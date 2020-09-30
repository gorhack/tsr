package events.tracked.tsr.event.task

data class EventTaskCategoryDTO (
    val eventTaskCategoryId: Long = 0,
    val eventTaskName: String = "",
    val eventTaskDisplayName: String = ""
) {
    constructor(eventTaskCategory: EventTaskCategory): this(
        eventTaskCategoryId = eventTaskCategory.eventTaskCategoryId, eventTaskName = eventTaskCategory.eventTaskName, eventTaskDisplayName = eventTaskCategory.eventTaskDisplayName
    )
}