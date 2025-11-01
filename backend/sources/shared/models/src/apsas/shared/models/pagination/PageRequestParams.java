package apsas.shared.models.pagination;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

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
    Integer page,
    @Parameter(
        description = "Number of items per page",
        example = "10",
        schema = @Schema(defaultValue = "10", minimum = "1", maximum = "100")
    )
    Integer size,
    @Parameter(
        description =
            "Sort by field(s). Format: field1,direction;field2,direction. Direction can be 'asc' or 'desc'. Multiple sort criteria separated by semicolon.",
        example = "createdAt,desc;name,asc"
    )
    String sort
) {
  /**
   * Converts the request parameters to a Spring Data Pageable object.
   *
   * @return Pageable instance
   */
  public Pageable toPageable() {
    if (sort == null || sort.isBlank()) {
      return PageRequest.of(page, size);
    }

    Sort sortObj = parseSort(sort);
    return PageRequest.of(
        page == null ? 0 : Math.max(page, 0),
        size == null ? 10 : Math.min(Math.max(size, 1), 100),
        sortObj
    );
  }

  /**
   * Parses sort string into Spring Data Sort object. Format: field1,direction;field2,direction
   * Direction can be 'asc' or 'desc'. Multiple sort criteria separated by semicolon.
   *
   * @param sortString Sort string to parse
   * @return Sort object
   */
  private Sort parseSort(String sortString) {
    String[] sortCriteria = sortString.split(";");
    Sort sort = Sort.unsorted();

    for (String criterion : sortCriteria) {
      String[] parts = criterion.trim().split(",");
      if (parts.length == 0 || parts[0].isBlank()) {
        continue;
      }

      String field = parts[0].trim();
      Direction direction =
          parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())
              ? Direction.DESC
              : Direction.ASC;

      sort = sort.and(Sort.by(direction, field));
    }

    return sort;
  }
}
