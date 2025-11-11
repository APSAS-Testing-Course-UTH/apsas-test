package apsas.shared.models.pagination;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Lớp tiện ích để tạo tham số phân trang và sắp xếp.
 * Cung cấp phương thức hỗ trợ chuyển đổi tham số request thành đối tượng Pageable của Spring Data.
 */
public record PageRequestParams(
    @Parameter(
        description = "Số trang (bắt đầu từ 0)",
        example = "0",
        schema = @Schema(defaultValue = "0", minimum = "0")
    )
    @RequestParam(defaultValue = "0", required = false)
    Integer page,
    @Parameter(
        description = "Số lượng phần tử mỗi trang",
        example = "10",
        schema = @Schema(defaultValue = "10", minimum = "1", maximum = "100")
    )
    @RequestParam(defaultValue = "10", required = false)
    Integer size
) {
  /**
   * Chuyển đổi tham số request thành đối tượng Pageable của Spring Data.
   *
   * @return Đối tượng Pageable
   */
  public Pageable toPageable() {
    return PageRequest.of(
        page == null ? 0 : Math.max(page, 0),
        size == null ? 10 : Math.min(Math.max(size, 1), 100)
    );
  }
}
