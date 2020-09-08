package events.tracked.tsr.event.type

import org.springframework.stereotype.Service

@Service
class EventTypeService(
    private val eventTypeRepository: EventTypeRepository
) {
    fun getAllEventTypes(): List<EventType> {
        return eventTypeRepository.findAll()
    }
}
