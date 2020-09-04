package events.tracked.tsr.event

import javax.persistence.*

@Entity
@Table(name = "organization")
data class Organization (
        @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
        var organizationId: Long = 0,
        var organizationName: String = "",
        var organizationDisplayName: String = "",
        var sortOrder: Int = 0
)