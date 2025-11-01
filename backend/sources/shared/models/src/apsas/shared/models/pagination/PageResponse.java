package apsas.shared.models.pagination;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Generic paginated response wrapper.
 *
 * @param <T> The type of content in the page
 */
@Schema(description = "Paginated response wrapper")
public record PageResponse<T>(
    @Schema(description = "List of items in the current page") List<T> content,
    @Schema(description = "Current page number (0-indexed)", example = "0") int pageNumber,
    @Schema(description = "Number of items per page", example = "10") int pageSize,
    @Schema(description = "Total number of items across all pages", example = "100")
        long totalElements,
    @Schema(description = "Total number of pages", example = "10") int totalPages,
    @Schema(description = "Whether this is the first page", example = "true") boolean first,
    @Schema(description = "Whether this is the last page", example = "false") boolean last,
    @Schema(description = "Whether there is a next page", example = "true") boolean hasNext,
    @Schema(description = "Whether there is a previous page", example = "false")
        boolean hasPrevious) {

  /**
   * Creates a PageResponse from Spring Data's Page object.
   *
   * @param page Spring Data Page object
   * @param <T> The type of content
   * @return PageResponse instance
   */
  public static <T> PageResponse<T> of(org.springframework.data.domain.Page<T> page) {
    return new PageResponse<>(
        page.getContent(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.isFirst(),
        page.isLast(),
        page.hasNext(),
        page.hasPrevious());
  }
}
