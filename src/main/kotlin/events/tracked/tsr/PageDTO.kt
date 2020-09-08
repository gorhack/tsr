package events.tracked.tsr

import org.springframework.data.domain.Page

data class PageDTO<T>(
        val items: List<T>,
        val totalResults: Long,
        val totalPages: Int,
        val pageSize: Int,
        val pageNumber: Int,
        val isFirst: Boolean,
        val isLast: Boolean
) {
    constructor() : this(listOf<T>(), 0L, 0, 0, 0, false, false)
    constructor(page: Page<T>) : this(
            page.content,
            page.totalElements,
            page.totalPages,
            page.pageable.pageSize,
            page.pageable.pageNumber,
            page.isFirst,
            page.isLast
    )
}