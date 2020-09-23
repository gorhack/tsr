package events.tracked.tsr.event.task

import events.tracked.tsr.event.Event
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface EventTaskCommentRepository: JpaRepository<EventTaskComment, Long>, PagingAndSortingRepository<EventTaskComment, Long> {
    // TODO fun findAllByEventTaskEventTaskId(eventTaskId: Long, paging: Pageable): Page<EventTaskComment>
}