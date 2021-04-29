package events.tracked.tsr

import org.springframework.http.HttpStatus

import java.time.LocalDateTime

import com.fasterxml.jackson.annotation.JsonFormat


class ApiError: Throwable {
    var status: HttpStatus
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy hh:mm:ss")
    val timestamp: LocalDateTime = LocalDateTime.now()
    override var message: String
    var debugMessage: String? = null

    constructor(status: HttpStatus, message: String) {
        this.status = status
        this.message = message
    }

    constructor(status: HttpStatus, ex: Throwable) {
        this.status = status
        this.message = "Unexpected error"
        this.debugMessage = ex.localizedMessage
    }

    constructor(status: HttpStatus, message: String, ex: Throwable) {
        this.status = status
        this.message = message
        this.debugMessage = ex.localizedMessage
    }
    override fun fillInStackTrace(): Throwable {
        // do not fill in the stack trace
        return this
    }
}