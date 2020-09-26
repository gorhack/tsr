package events.tracked.tsr.event.task

import events.tracked.tsr.user.TsrUserDTO
import java.time.OffsetDateTime

data class EventTaskDTO(
    val eventTaskId: Long = 0L,
    val eventTaskCategory: EventTaskCategory = EventTaskCategory(),
    val eventId: Long = 0L,
    val suspenseDate: OffsetDateTime = OffsetDateTime.parse("1970-01-01T00:00:01-08:00"),
    val approver: TsrUserDTO = TsrUserDTO(),
    val resourcer: TsrUserDTO = TsrUserDTO(),
    val status: EventTaskStatus = EventTaskStatus(statusId = 1L, "CREATED", "created", EventTaskStatusCode.R, 2),
    val comments: List<EventTaskCommentDTO> = emptyList()
)