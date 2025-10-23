package apsas.shared.common.util;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Utility class for creating pagination and sorting parameters. This class provides helper methods
 * to convert request parameters into Spring Data Pageable objects.
 */
public class PageRequestParams {

  @Parameter(description = "Page number (0-indexed)", example = "0", schema = @Schema(defaultValue = "0", minimum = "0"))
  private Integer page = 0;

  @Parameter(description = "Number of items per page", example = "10", schema = @Schema(defaultValue = "10", minimum = "1", maximum = "100"))
  private Integer size = 10;

  @Parameter(description = "Sort by field(s). Format: field1,direction;field2,direction. Direction can be 'asc' or 'desc'. Multiple sort criteria separated by semicolon.", example = "createdAt,desc;name,asc")
  private String sort;

  public PageRequestParams() {}

  public PageRequestParams(Integer page, Integer size, String sort) {
    this.page = page != null ? page : 0;
    this.size = size != null ? size : 10;
    this.sort = sort;
  }

  /**
   * Creates a PageRequestParams with default values.
   *
   * @return Default PageRequestParams (page=0, size=10, no sort)
   */
  public static PageRequestParams defaultParams() {
    return new PageRequestParams(0, 10, null);
  }

  /**
   * Creates a PageRequestParams with specified page and size.
   *
   * @param page Page number
   * @param size Page size
   * @return PageRequestParams instance
   */
  public static PageRequestParams of(Integer page, Integer size) {
    return new PageRequestParams(page, size, null);
  }

  /**
   * Creates a PageRequestParams with all parameters.
   *
   * @param page Page number
   * @param size Page size
   * @param sort Sort string
   * @return PageRequestParams instance
   */
  public static PageRequestParams of(Integer page, Integer size, String sort) {
    return new PageRequestParams(page, size, sort);
  }

  public Integer getPage() {
    return page;
  }

  public void setPage(Integer page) {
    this.page = page != null ? page : 0;
  }

  public Integer getSize() {
    return size;
  }

  public void setSize(Integer size) {
    this.size = size != null && size > 0 && size <= 100 ? size : 10;
  }

  public String getSort() {
    return sort;
  }

  public void setSort(String sort) {
    this.sort = sort;
  }

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
    return PageRequest.of(page, size, sortObj);
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
      Sort.Direction direction =
          parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())
              ? Sort.Direction.DESC
              : Sort.Direction.ASC;

      sort = sort.and(Sort.by(direction, field));
    }

    return sort;
  }
}