package events.tracked.tsr.client

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
    private val id: Long = 0
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
}