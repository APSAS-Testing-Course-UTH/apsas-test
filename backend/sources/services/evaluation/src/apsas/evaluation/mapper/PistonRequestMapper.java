package apsas.evaluation.mapper;

import apsas.evaluation.model.dto.PistonExecuteRequest;
import apsas.evaluation.model.dto.PistonExecuteRequest.FileContent;
import apsas.feign.dto.TestCaseDto;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * MapStruct mapper for creating Piston API request objects
 */
@Component
public class PistonRequestMapper {

  /**
   * Create Piston execute request from code and test case
   *
   * @param codeBase64 Student's code (base64 encoded)
   * @param language   Programming language
   * @param testCase   Test case
   * @return Piston execute request
   */
  public PistonExecuteRequest createExecuteRequest(
      String codeBase64,
      String language,
      TestCaseDto testCase
  ) {
    List<PistonExecuteRequest.FileContent> files = new ArrayList<>();

    var fileName = getFileName(language);
    files.add(new FileContent(fileName, codeBase64, FileContent.BASE64_ENCODING));

    var timeout = testCase.getTimeout() != null ? testCase.getTimeout() : 5000;
    var memoryLimit =
        testCase.getMemoryLimit() != null ? testCase.getMemoryLimit().longValue() * 1024 * 1024
            : -1L;

    return new PistonExecuteRequest(
        language,
        "*",
        files,
        testCase.getInput(),
        timeout,
        timeout,
        memoryLimit
    );
  }

  private String getFileName(String language) {
    return switch (language.toLowerCase()) {
      case "java" -> "Main.java";
      case "python", "python3" -> "main.py";
      case "javascript", "js", "node" -> "main.js";
      case "typescript", "ts" -> "main.ts";
      case "c" -> "main.c";
      case "cpp", "c++" -> "main.cpp";
      case "go" -> "main.go";
      case "rust" -> "main.rs";
      case "ruby" -> "main.rb";
      case "php" -> "main.php";
      case "csharp", "c#" -> "Main.cs";
      case "kotlin", "kt" -> "Main.kt";
      default -> null;
    };
  }
}
