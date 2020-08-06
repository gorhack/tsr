package events.tracked.tsr.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.util.*

@Configuration
class WebConfig
    : WebMvcConfigurer {
    /**
     * Ensure client-side paths redirect to index.html because client handles routing. NOTE: Do NOT use @EnableWebMvc or it will break this.
     */
    override fun addViewControllers(registry: ViewControllerRegistry)
    {
        val viewName = "forward:/index.html"
        // Map "/"
        registry.addViewController("/")
                .setViewName(viewName)

        // Map "/word", "/word/word", and "/word/word/word" - except for anything starting with "/api/..." or ending with
        // a file extension like ".js" - to index.html. By doing this, the client receives and routes the url. It also
        // allows client-side URLs to be bookmarked.

        // Single directory level - no need to exclude "api"
        registry.addViewController("/{x:[\\w\\-]+}")
                .setViewName(viewName)
        // Multi-level directory path, need to exclude "api" on the first part of the path
        registry.addViewController("/{x:^(?!api$).*$}/**/{y:[\\w\\-]+}")
                .setViewName(viewName)

        // can be set runtime before Spring instantiates any beans
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    }
}