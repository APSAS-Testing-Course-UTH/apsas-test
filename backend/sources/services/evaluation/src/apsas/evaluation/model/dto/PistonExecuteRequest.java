package apsas.evaluation.model.dto;

import java.util.List;

/**
 * Request model for Piston API execute endpoint
 */
public record PistonExecuteRequest(
    String language,
    String version,
    List<FileContent> files,
    String stdin,
    List<String> args,
    Integer runTimeout,
    Integer compileTimeout,
    Long compileMemoryLimit,
    Long runMemoryLimit
) {
  public PistonExecuteRequest(
      String language,
      String version,
      List<FileContent> files,
      String stdin,
      Integer runTimeout,
      Integer compileTimeout,
      Long runMemoryLimit
  ) {
    this(
        language,
        version,
        files,
        stdin != null ? stdin : "",
        null,
        runTimeout,
        compileTimeout,
        -1L,
        runMemoryLimit
    ); // No limit
  }

  public record FileContent(String name, String content, String encoding) {
    public FileContent(String name, String content) {
      this(name, content, "utf8");
    }
  }
}
