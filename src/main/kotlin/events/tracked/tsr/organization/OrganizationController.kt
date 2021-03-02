package events.tracked.tsr.organization

import events.tracked.tsr.NameTooLongException
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
    fun allOrgNames(@RequestParam("page", defaultValue = "0") page: Int,
                    @RequestParam("size", defaultValue = "10") size: Int,
                    @RequestParam("sortBy", defaultValue = "sortOrder") sortBy: String): ResponseEntity<PageDTO<OrganizationDTO>>? {
        return when (sortBy) {
            "sortOrder" -> ResponseEntity<PageDTO<OrganizationDTO>>(
                organizationService.getAllOrgNames(page, size, Sort.by(sortBy)),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }

    @PostMapping(value = [""])
    @Throws(NameTooLongException::class)
    fun saveOrganization(
        @RequestBody organizationDTO: OrganizationDTO
    ): ResponseEntity<OrganizationDTO> {
        if (organizationDTO.organizationName.length > 255) {
            throw NameTooLongException("Organization name too long. Limited to 255 characters.")
        }
        return ResponseEntity<OrganizationDTO>(organizationService.saveOrganization(organizationDTO), HttpHeaders(), HttpStatus.CREATED)
    }

    @GetMapping(value = ["/search"])
    fun getOrganizationsContains(@RequestParam("searchTerm", defaultValue = "") searchTerm: String,
                                 @RequestParam("page", defaultValue = "0") page: Int,
                                 @RequestParam("size", defaultValue = "10") size: Int,
                                 @RequestParam("sortBy", defaultValue = "sortOrder") sortBy: String
    ): ResponseEntity<PageDTO<OrganizationDTO>> {
        return when (sortBy) {
            "sortOrder" -> ResponseEntity<PageDTO<OrganizationDTO>>(
                organizationService.getOrganizationsContains(searchTerm, page, size, Sort.by(sortBy)),
                HttpHeaders(),
                HttpStatus.OK
            )
            else -> ResponseEntity(PageDTO(), HttpHeaders(), HttpStatus.BAD_REQUEST)
        }
    }
}
