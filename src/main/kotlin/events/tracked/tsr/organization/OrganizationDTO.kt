package events.tracked.tsr.organization

data class OrganizationDTO (
    var organizationId: Long = 0,
    var organizationName: String = "",
    var organizationDisplayName: String = "",
    var sortOrder: Int = 0
) {
    constructor(organization: Organization) : this(
        organizationId = organization.organizationId, organizationName = organization.organizationName, organizationDisplayName = organization.organizationDisplayName, sortOrder = organization.sortOrder
    )

    fun toOrganization(): Organization {
        return Organization(
            organizationId = this.organizationId,
            organizationName = this.organizationName,
            organizationDisplayName = this.organizationDisplayName,
            sortOrder = this.sortOrder
        )
    }
}