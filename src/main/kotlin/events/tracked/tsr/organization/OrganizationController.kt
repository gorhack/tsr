package events.tracked.tsr.organization

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/v1/organization"])
class OrganizationController(
    private val organizationService: OrganizationService
) {
    @GetMapping(value = [""])
    fun allOrgNames(): List<Organization>? {
        return organizationService.getAllOrgNames()
    }
}
