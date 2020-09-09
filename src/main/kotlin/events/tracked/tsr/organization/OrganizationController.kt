package events.tracked.tsr.organization

import events.tracked.tsr.PageDTO
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
    @GetMapping(value = ["/search"])
    fun getOrganizationsContaining(@RequestParam("search", defaultValue = "") search: String,
                                       @RequestParam("page", defaultValue = "0") page: Int,
                                       @RequestParam("size", defaultValue = "10") size: Int,
    ): PageDTO<Organization>{
        return organizationService.getOrganizationsContaining(search, page, size)
    }
}


