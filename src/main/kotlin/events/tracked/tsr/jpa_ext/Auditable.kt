package events.tracked.tsr.jpa_ext

import javax.persistence.Column
import javax.persistence.EntityListeners
import javax.persistence.MappedSuperclass
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.OffsetDateTime

@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class Auditable {
    @CreatedBy
    @Column(name = "created_by", updatable = false)
    var createdBy: String = ""

    @CreatedDate
    @Column(name = "created_date", columnDefinition = "TIMESTAMP WITH TIME ZONE", updatable = false)
    var createdDate: OffsetDateTime? = null

    @LastModifiedBy
    @Column(name = "last_modified_by")
    var lastModifiedBy: String = ""

    @LastModifiedDate
    @Column(name = "last_modified_date", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    var lastModifiedDate: OffsetDateTime? = null
}