package events.tracked.tsr.client.user

import events.tracked.tsr.makeOidcUser
import events.tracked.tsr.organization.Organization
import events.tracked.tsr.organization.OrganizationDTO
import events.tracked.tsr.user.*
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.mockk.verifySequence
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
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
        val expected = TsrUserDTO(
            userId = userId,
            username = "username",
            role = UserRole.ADMIN,
            settings = UserSettingsDTO(
                organizations = hashSetOf(),
                phoneNumber = null,
                emailAddress = null
            )
        )
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
        val adminUser = TsrUser(1, "123", "admin", UserRole.ADMIN)
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
        val organization = Organization(
            organizationId = 1L,
            organizationName = "org1",
            organizationDisplayName = "org 1",
            sortOrder = 1
        )
        val organizationDTO = OrganizationDTO(
            organizationId = 1L,
            organizationName = "org1",
            organizationDisplayName = "org 1",
            sortOrder = 1
        )

        val organization2 = Organization(
            organizationId = 2L,
            organizationName = "org2",
            organizationDisplayName = "org 2",
            sortOrder = 2
        )
        val organizationDTO2 = OrganizationDTO(
            organizationId = 2L,
            organizationName = "org2",
            organizationDisplayName = "org 2",
            sortOrder = 2
        )

        val regularUser = TsrUser(
            id = 4,
            userId= "1234",
            username = "regular user",
            role = UserRole.USER,
            organizations = hashSetOf(organization),
            emailAddress = "test@example.com")
        val regularOidcUser = makeOidcUser(regularUser.userId, regularUser.username)
        every {
            mockTsrUserService.setUserSettings(
                regularOidcUser,
                UserSettingsDTO(
                    organizations = hashSetOf(organizationDTO, organizationDTO2),
                    phoneNumber = null,
                    emailAddress = "test@example.com"
                )
            )
        } returns regularUser.copy(organizations = hashSetOf(organization, organization2))

        val expectedResponse: ResponseEntity<TsrUserDTO> = ResponseEntity(TsrUserDTO(
            id = 4,
            userId = "1234",
            username = "regular user",
            role = UserRole.USER,
            settings = UserSettingsDTO(
                organizations = hashSetOf(organizationDTO, organizationDTO2),
                emailAddress = "test@example.com",
                phoneNumber = null)),
            HttpStatus.OK
        )

        assertEquals(
            expectedResponse,
            subject.setUserSettings(
                regularOidcUser,
                UserSettingsDTO(
                    organizations = hashSetOf(organizationDTO, organizationDTO2),
                    phoneNumber = null,
                    emailAddress = "test@example.com"
                )
            )
        )
        verifySequence {
            mockTsrUserService.setUserSettings(
                regularOidcUser,
                UserSettingsDTO(
                    organizations = hashSetOf(organizationDTO, organizationDTO2),
                    phoneNumber = null,
                    emailAddress = "test@example.com"
                )
            )
        }
    }

    @Test
    fun `any user can update their phone number and email address`() {
        val regularUser = TsrUser(
            id = 4,
            userId = "1234",
            username = "regular user",
            role = UserRole.USER,
            organizations = hashSetOf(),
            phoneNumber = null,
            emailAddress = "test@example.com"
        )
        val regularOidcUser = makeOidcUser(regularUser.userId, regularUser.username)
        every {
            mockTsrUserService.setUserSettings(
                regularOidcUser,
                UserSettingsDTO(
                    organizations = hashSetOf(),
                    phoneNumber = "1231231234",
                    emailAddress = "new@tracked.events"
                )
            )
        } returns regularUser.copy(
            organizations = hashSetOf(),
            phoneNumber = "1231231234",
            emailAddress = "new@tracked.events"
        )
        val expectedResponse = ResponseEntity(
            TsrUserDTO(
                id = 4,
                userId = "1234",
                username = "regular user",
                role = UserRole.USER,
                settings = UserSettingsDTO(
                    organizations = hashSetOf(),
                    phoneNumber = "1231231234",
                    emailAddress = "new@tracked.events"
                )
            ), HttpStatus.OK
        )
        assertEquals(
            expectedResponse,
            subject.setUserSettings(
                regularOidcUser,
                UserSettingsDTO(
                    organizations = hashSetOf(),
                    phoneNumber = "1231231234",
                    emailAddress = "new@tracked.events"
                )
            )
        )
        verifySequence {
            mockTsrUserService.setUserSettings(
                regularOidcUser,
                UserSettingsDTO(
                    organizations = hashSetOf(),
                    phoneNumber = "1231231234",
                    emailAddress = "new@tracked.events"
                )
            )
        }
    }
}