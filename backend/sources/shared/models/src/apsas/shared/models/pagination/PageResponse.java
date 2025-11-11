package apsas.shared.models.pagination;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Lớp bọc phản hồi phân trang tổng quát.
 *
 * @param <T> Kiểu dữ liệu của nội dung trang
 */
@Schema(description = "Lớp bọc phản hồi phân trang")
public record PageResponse<T>(
    @Schema(description = "Danh sách phần tử trong trang hiện tại") List<T> content,
    @Schema(description = "Số trang hiện tại (bắt đầu từ 0)", example = "0") int pageNumber,
    @Schema(description = "Số lượng phần tử mỗi trang", example = "10") int pageSize,
    @Schema(description = "Tổng số phần tử trên tất cả các trang", example = "100")
        long totalElements,
    @Schema(description = "Tổng số trang", example = "10") int totalPages,
    @Schema(description = "Có phải trang đầu tiên không", example = "true") boolean first,
    @Schema(description = "Có phải trang cuối cùng không", example = "false") boolean last,
    @Schema(description = "Có trang tiếp theo không", example = "true") boolean hasNext,
    @Schema(description = "Có trang trước đó không", example = "false")
        boolean hasPrevious) {

  /**
   * Tạo PageResponse từ đối tượng Page của Spring Data.
   *
   * @param page Đối tượng Page của Spring Data
   * @param <T> Kiểu dữ liệu của nội dung
   * @return Đối tượng PageResponse
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
