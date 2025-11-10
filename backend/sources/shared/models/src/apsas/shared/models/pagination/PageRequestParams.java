package apsas.shared.models.pagination;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Utility class for creating pagination and sorting parameters. This class provides helper methods
 * to convert request parameters into Spring Data Pageable objects.
 */
public record PageRequestParams(
    @Parameter(
        description = "Page number (0-indexed)",
        example = "0",
        schema = @Schema(defaultValue = "0", minimum = "0")
    )
    @RequestParam(defaultValue = "0", required = false)
    Integer page,
    @Parameter(
        description = "Number of items per page",
        example = "10",
        schema = @Schema(defaultValue = "10", minimum = "1", maximum = "100")
    )
    @RequestParam(defaultValue = "10", required = false)
    Integer size
) {
  /**
   * Converts the request parameters to a Spring Data Pageable object.
   *
   * @return Pageable instance
   */
  public Pageable toPageable() {
    return PageRequest.of(
        page == null ? 0 : Math.max(page, 0),
        size == null ? 10 : Math.min(Math.max(size, 1), 100)
    );
  }
}
