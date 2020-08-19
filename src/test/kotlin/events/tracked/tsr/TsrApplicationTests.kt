package events.tracked.tsr

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
@ContextConfiguration(classes = [SpringBootTest::class])
@SpringBootTest
class TsrApplicationTests {

	@Test
	fun contextLoads() {
	}

}
