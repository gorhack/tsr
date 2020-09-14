package events.tracked.tsr.client.user

import io.mockk.*
import events.tracked.tsr.makeOidcUser
import events.tracked.tsr.organization.Organization
import events.tracked.tsr.organization.OrganizationDTO
import events.tracked.tsr.user.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

class UserControllerTest {
    private lateinit var mockTsrUserService: TsrUserService
    private lateinit var subject: UserController

    private val userId = "00000000-0000-0000-0000-000000000000"
    private val devUser = makeOidcUser(userId = userId, userName = "username")
    private val tsrUser = TsrUser(userId = userId, username = "username", role = UserRole.ADMIN)
    private val userRoleUpdate = UserRoleUpdateDTO(role = UserRole.ADMIN, userId = userId)

    @BeforeEach
    fun setup() {
        mockTsrUserService = mockk(relaxUnitFun = true)
        subject = UserController(mockTsrUserService)
    }

    @Test
    fun `test getUser`() {
        every { mockTsrUserService.assertUserExistsAndReturnUser(devUser) } returns tsrUser
        val result = subject.userInfo(devUser)
        val expected = TsrUserDTO(userId = userId, username = "username", role = UserRole.ADMIN, organization = mutableListOf())
        assertEquals(expected, result)
    }

    @Test
    fun `assert user exists when userInfo is called`() {
        every { mockTsrUserService.assertUserExistsAndReturnUser(devUser) } returns tsrUser
        subject.userInfo(devUser)

        verify { mockTsrUserService.assertUserExistsAndReturnUser(devUser) }
    }

    @Test
    fun `admin user can update user roles`() {
        val adminUser = TsrUser( 1, "123", "admin", UserRole.ADMIN)
        val adminOidcUser = makeOidcUser(adminUser.userId, adminUser.username)

        every { mockTsrUserService.assertUserIsAdmin(adminOidcUser) } returns true

        subject.saveUserRole(adminOidcUser, userRoleUpdate)

        verify { mockTsrUserService.assertUserIsAdmin(adminOidcUser) }
        verify { mockTsrUserService.updateUserRole(userRoleUpdate) }
    }

    @Test
    fun `regular user cannot update any user roles`() {
        val regularUser = TsrUser(4, "456", "regular", UserRole.USER)
        val regularOidcUser = makeOidcUser(regularUser.userId, regularUser.username)

        every { mockTsrUserService.assertUserIsAdmin(regularOidcUser) } returns false

        subject.saveUserRole(regularOidcUser, userRoleUpdate)

        verify { mockTsrUserService.assertUserIsAdmin(regularOidcUser) }
        verify(exactly = 0) { mockTsrUserService.updateUserRole(userRoleUpdate) }
    }

    @Test
    fun `any user can update their organizations`() {
        val organization = Organization(organizationId = 1L, organizationName = "org1", organizationDisplayName = "org 1", sortOrder = 1)
        val organizationDTO = OrganizationDTO(organizationId = 1L, organizationName = "org1", organizationDisplayName = "org 1", sortOrder = 1)

        val organization2 = Organization(organizationId = 2L, organizationName = "org2", organizationDisplayName = "org 2", sortOrder = 2)
        val organizationDTO2 = OrganizationDTO(organizationId = 2L, organizationName = "org2", organizationDisplayName = "org 2", sortOrder = 2)

        val regularUser = TsrUser(4, "1234", "regular user", UserRole.USER, mutableListOf(organization))
        val regularOidcUser = makeOidcUser(regularUser.userId, regularUser.username)
        every { mockTsrUserService.assertUserExistsAndReturnUser(regularOidcUser) } returns regularUser
        every {
            mockTsrUserService.setUserOrganizations(regularUser, listOf(organizationDTO, organizationDTO2))
        } returns regularUser.copy(organizations = mutableListOf(organization, organization2))

        val expectedResponse = ResponseEntity(TsrUser(4, "1234", "regular user", UserRole.USER, mutableListOf(organization, organization2)), HttpStatus.OK)

        assertEquals(expectedResponse, subject.setUserOrganizations(regularOidcUser, listOf(organizationDTO, organizationDTO2)))
        verifySequence {
            mockTsrUserService.assertUserExistsAndReturnUser(regularOidcUser)
            mockTsrUserService.setUserOrganizations(regularUser, listOf(organizationDTO, organizationDTO2))
        }
    }
}