package events.tracked.tsr.client.user

import events.tracked.tsr.makeOidcUser
import events.tracked.tsr.organization.Organization
import events.tracked.tsr.organization.OrganizationDTO
import events.tracked.tsr.user.*
import io.mockk.Called
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.core.authority.SimpleGrantedAuthority

class TsrUserServiceTest {
    private lateinit var subject: TsrUserService
    private lateinit var tsrUser: TsrUser
    private lateinit var mockTsrUserRepository: TsrUserRepository
    private val userId = "99999"
    private val aTsrUser = TsrUser(1, userId, "tsrUser1", UserRole.USER)
    private val adminTsrUser = aTsrUser.copy(role = UserRole.ADMIN)
    private val oidcUser = makeOidcUser(userId, "username")

    @BeforeEach
    fun setup() {
        mockTsrUserRepository = mockk(relaxUnitFun = true)
        subject = TsrUserService(mockTsrUserRepository)
        tsrUser = TsrUser(userId = "99999", username = "username", role = UserRole.USER)
    }

    @Test
    fun `assertUserExists checks to see if user is in database`() {
        val user = makeOidcUser(userId, "username")
        every { mockTsrUserRepository.findByUserId(userId) } returns tsrUser
        subject.assertUserExistsAndReturnUser(user)
        verify { mockTsrUserRepository.findByUserId(userId) }
    }

    @Test
    fun `assertUserExists creates a new user if it doesnt exist`() {
        val user = makeOidcUser(userId, "username")
        every { mockTsrUserRepository.count() } returns 1
        every { mockTsrUserRepository.findByUserId(userId) } returns null
        every { user.preferredUsername } returns "preferredUserName"
        every { user.authorities } returns listOf()

        val tsrUserWithPreferred = tsrUser.copy(username = "preferredUserName")
        every { mockTsrUserRepository.save(tsrUserWithPreferred) } returns tsrUserWithPreferred
        subject.assertUserExistsAndReturnUser(user)
        verify { mockTsrUserRepository.findByUserId(userId) }
        verify { mockTsrUserRepository.save(tsrUserWithPreferred) }
    }

    @Test
    fun `assertUserExists creates a new user with userName if preferredUserName does not exist`() {
        val user = makeOidcUser(userId, "username")
        every { mockTsrUserRepository.count() } returns 1
        every { mockTsrUserRepository.findByUserId(userId) } returns null
        every { user.preferredUsername } returns null
        every { user.authorities } returns listOf()

        every { mockTsrUserRepository.save(tsrUser) } returns tsrUser
        subject.assertUserExistsAndReturnUser(user)
        verify { mockTsrUserRepository.findByUserId(userId) }
        verify { mockTsrUserRepository.save(tsrUser) }
    }

    @Test
    fun `assertUserExists does NOT create a new user if it already exists`() {
        val user = makeOidcUser(userId, "username")
        every { mockTsrUserRepository.findByUserId(userId) } returns tsrUser
        subject.assertUserExistsAndReturnUser(user)
        verify { mockTsrUserRepository.findByUserId(userId) }
        verify(inverse = true) { mockTsrUserRepository.save(tsrUser) }
    }

    @Test
    fun `isEmpty returns true if no users exist`() {
        every { mockTsrUserRepository.count() } returns 0

        val noUsers = subject.isEmpty()
        assertThat(noUsers).isTrue()

        verify { mockTsrUserRepository.count() }
    }

    @Test
    fun `isEmpty returns false if users exist`() {
        every { mockTsrUserRepository.count() } returns 1

        val noUsers = subject.isEmpty()
        assertThat(noUsers).isFalse()

        verify { mockTsrUserRepository.count() }
    }

    @Test
    fun `assertUserExists creates a new user with role admin if there are no users`() {
        val user = makeOidcUser(userId, "username")
        every { mockTsrUserRepository.findByUserId(userId) } returns null
        every { mockTsrUserRepository.count() } returns 0
        every { user.preferredUsername } returns user.userName
        every { user.authorities } returns listOf()
        every { mockTsrUserRepository.save(any() as TsrUser) } returns tsrUser


        subject.assertUserExistsAndReturnUser(user) //should

        verify { mockTsrUserRepository.findByUserId(userId) }

        verify(exactly = 1) {
            mockTsrUserRepository.save(
                withArg<TsrUser> {
                    assertThat(it.role).isEqualTo(UserRole.ADMIN)
                }
            )
        }
    }

    @Test
    fun `assertUserExists creates a new user with role user if there are users and user does not have tsradmin role`() {
        val user = makeOidcUser(userId, "username")
        every { mockTsrUserRepository.findByUserId(userId) } returns null
        every { mockTsrUserRepository.count() } returns 1
        every { user.preferredUsername } returns user.userName
        every { user.authorities } returns listOf()
        every { mockTsrUserRepository.save(any() as TsrUser) } returns tsrUser

        subject.assertUserExistsAndReturnUser(user)

        verify { mockTsrUserRepository.findByUserId(userId) }

        verify(exactly = 1) {
            mockTsrUserRepository.save(
                withArg<TsrUser> {
                    assertThat(it.role).isEqualTo(UserRole.USER)
                }
            )
        }
    }

    @Test
    fun `assertUserExists creates a new user with role admin if there are users and user is a tsradmin role`() {
        val user = makeOidcUser(userId, "username")
        every { mockTsrUserRepository.findByUserId(userId) } returns null
        every { mockTsrUserRepository.count() } returns 1
        every { user.preferredUsername } returns user.userName
        every { user.authorities } returns listOf(SimpleGrantedAuthority("SCOPE_tsr.admin"))
        every { mockTsrUserRepository.save(any() as TsrUser) } returns adminTsrUser

        subject.assertUserExistsAndReturnUser(user)

        verify { mockTsrUserRepository.findByUserId(userId) }

        verify(exactly = 1) {
            mockTsrUserRepository.save(
                withArg<TsrUser> {
                    assertThat(it.role).isEqualTo(UserRole.ADMIN)
                }
            )
        }
    }

    @Test
    fun `updateUserRole updates a users role`() {
        val userId = "222222"

        every { mockTsrUserRepository.findByUserId(userId) } returns aTsrUser
        every { mockTsrUserRepository.save(adminTsrUser) } returns adminTsrUser

        val userRoleUpdate = UserRoleUpdateDTO(UserRole.ADMIN, userId)
        subject.updateUserRole(userRoleUpdate)

        verify { mockTsrUserRepository.save(adminTsrUser) }
    }

    @Test
    fun `updateUserRole throws exception when user is not found`() {
        every { mockTsrUserRepository.findByUserId("invalid user id") } returns null

        val userRoleUpdate = UserRoleUpdateDTO(UserRole.ADMIN, "invalid user id")
        var expectedErrorWasThrown = false

        try {
            subject.updateUserRole(userRoleUpdate)
        } catch (e: IllegalArgumentException) {
            verify { mockTsrUserRepository.save(any<TsrUser>()) wasNot Called }
            expectedErrorWasThrown = true
        }

        assertThat(expectedErrorWasThrown).describedAs("Expected error was not thrown").isTrue()
    }

    @Test
    fun `assertUserIsAdmin checks to see if a user is an admin`() {
        every { mockTsrUserRepository.findByUserId(aTsrUser.userId) } returns adminTsrUser
        val adminResult = subject.assertUserIsAdmin(oidcUser)
        assert(adminResult)

        every { mockTsrUserRepository.findByUserId(aTsrUser.userId) } returns aTsrUser
        val userResult = subject.assertUserIsAdmin(oidcUser)
        assertThat(userResult).isFalse()
    }

    @Test
    fun `setUserOrganizations updates a users organizations`() {
        val organization = Organization(organizationId = 1L, organizationName = "org1", organizationDisplayName = "org 1", sortOrder = 1)
        val organizationDTO = OrganizationDTO(organizationId = 1L, organizationName = "org1", organizationDisplayName = "org 1", sortOrder = 1)

        val organization2 = Organization(organizationId = 2L, organizationName = "org2", organizationDisplayName = "org 2", sortOrder = 2)
        val organizationDTO2 = OrganizationDTO(organizationId = 2L, organizationName = "org2", organizationDisplayName = "org 2", sortOrder = 2)

        val userToUpdate = TsrUser(1L, "1234", "user", UserRole.USER, organizations = mutableListOf(organization))
        val savedTsrUser = TsrUser(1L, "1234", "user", UserRole.USER, organizations = mutableListOf(organization, organization2))

        every { mockTsrUserRepository.save(savedTsrUser) } returns savedTsrUser
        assertEquals(savedTsrUser, subject.setUserSettings(userToUpdate, UserSettingsDTO(organizations = listOf(organizationDTO, organizationDTO2))))
    }
}