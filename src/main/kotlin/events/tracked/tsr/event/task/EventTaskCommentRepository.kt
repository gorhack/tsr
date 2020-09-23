package events.tracked.tsr.event.task

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EventTaskCommentRepository: JpaRepository<EventTaskComment, Long>