package events.tracked.tsr.user

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TsrUserRepository: JpaRepository<TsrUser, Long> {
    fun findByUserId(userId: String): TsrUser?
}
