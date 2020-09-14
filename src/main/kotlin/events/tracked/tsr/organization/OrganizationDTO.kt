package events.tracked.tsr.organization

data class OrganizationDTO (
    var organizationId: Long = 0,
    var organizationName: String = "",
    var organizationDisplayName: String = "",
    var sortOrder: Int = 0
){
    constructor(organization: Organization) : this(
        organizationId = organization.organizationId, organizationName = organization.organizationName, organizationDisplayName = organization.organizationDisplayName, sortOrder = organization.sortOrder
    )

    private fun copyInto(organization: Organization): Organization {
        val organizationCopy = organization.copy (
            organizationId = this.organizationId,
            organizationName = this.organizationName,
            organizationDisplayName = this.organizationDisplayName,
            sortOrder = this.sortOrder
        )
        organizationCopy.lastModifiedDate = organization.lastModifiedDate
        organizationCopy.lastModifiedBy = organization.lastModifiedBy
        organizationCopy.createdDate = organization.createdDate
        organizationCopy.createdBy = organization.createdBy
        return organizationCopy
    }

    fun toOrganization(): Organization {
        return copyInto(Organization())
    }
}