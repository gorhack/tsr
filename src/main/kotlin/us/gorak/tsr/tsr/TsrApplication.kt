package us.gorak.tsr.tsr

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class TsrApplication

fun main(args: Array<String>) {
	runApplication<TsrApplication>(*args)
}
