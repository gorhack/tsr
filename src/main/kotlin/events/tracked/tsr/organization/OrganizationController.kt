package events.tracked.tsr.organization

import events.tracked.tsr.PageDTO
import org.springframework.data.domain.Sort
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
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
    fun saveOrganization(@RequestBody displayName: String): ResponseEntity<Organization> {
        return ResponseEntity(organizationService.saveOrganization(displayName), HttpHeaders(), HttpStatus.CREATED)
    }
    @GetMapping(value = ["/search"])
    fun getOrganizationsContains(@RequestParam("searchTerm", defaultValue = "") search: String,
                                 @RequestParam("page", defaultValue = "0") page: Int,
                                 @RequestParam("size", defaultValue = "10") size: Int,
                                 @RequestParam("sortBy", defaultValue = "sortOrder") sortBy: String
    ): ResponseEntity<PageDTO<Organization>> {
        return when (sortBy) {
            "sortOrder" -> ResponseEntity<PageDTO<Organization>>(
                    organizationService.getOrganizationsContains(search, page, size, Sort.by(sortBy)),
                    HttpHeaders(),
                    HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }
}


