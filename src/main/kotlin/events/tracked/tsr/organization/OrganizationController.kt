package events.tracked.tsr.organization

import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(value = ["/api/v1/organization"])
class OrganizationController(
    private val organizationService: OrganizationService
) {
    @GetMapping(value = [""])
    fun allOrgNames(): List<Organization>? {
        return organizationService.getAllOrgNames()
    }
    @PostMapping(value = [""])
    fun saveOrganization(@PathVariable("displayName") displayName: String): Organization {
        return organizationService.saveOrganization(displayName)
    }
}


