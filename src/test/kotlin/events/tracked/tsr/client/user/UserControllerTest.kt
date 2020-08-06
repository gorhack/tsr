package events.tracked.tsr.client.user

import io.mockk.*
import events.tracked.tsr.makeOidcUser
import events.tracked.tsr.user.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertEquals

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
        val expected = TsrUserDTO(userId = userId, username = "username", role = UserRole.ADMIN)
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
}