package events.tracked.tsr.event.task

data class EventTaskCategoryDTO (
    val eventTaskCategoryId: Long = 0,
    val eventTaskName: String = "",
    val eventTaskDisplayName: String = ""
) {
    constructor(eventTaskCategory: EventTaskCategory): this(
        eventTaskCategoryId = eventTaskCategory.eventTaskCategoryId, eventTaskName = eventTaskCategory.eventTaskName, eventTaskDisplayName = eventTaskCategory.eventTaskDisplayName
    )

    private fun copyInto(eventTaskCategory: EventTaskCategory): EventTaskCategory {
        val eventTaskCategoryCopy = eventTaskCategory.copy(
            eventTaskDisplayName = this.eventTaskDisplayName,
            eventTaskName = this.eventTaskName
        )
        eventTaskCategoryCopy.lastModifiedDate = eventTaskCategory.lastModifiedDate
        eventTaskCategoryCopy.lastModifiedBy = eventTaskCategory.lastModifiedBy
        eventTaskCategoryCopy.createdBy = eventTaskCategory.createdBy
        eventTaskCategoryCopy.createdDate = eventTaskCategory.createdDate
        return eventTaskCategoryCopy
    }

    fun toEventTaskCategory(): EventTaskCategory {
        return copyInto(EventTaskCategory())
    }
}