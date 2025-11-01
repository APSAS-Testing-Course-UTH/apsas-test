package apsas.evaluation.mapper;

import apsas.evaluation.model.dto.PistonExecuteRequest;
import apsas.feign.dto.TestCaseDto;
import java.util.ArrayList;
import java.util.List;
import org.mapstruct.Mapper;

/**
 * MapStruct mapper for creating Piston API request objects
 */
@Mapper(componentModel = "spring")
public interface PistonRequestMapper {

  /**
   * Get appropriate file name based on language
   *
   * @param language Programming language
   * @return File name
   */
  default String getFileName(String language) {
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
      default -> "main.txt";
    };
  }

  /**
   * Create Piston execute request from code and test case
   *
   * @param code     Student's code
   * @param language Programming language
   * @param testCase Test case
   * @return Piston execute request
   */
  default PistonExecuteRequest createExecuteRequest(
      String code, String language, TestCaseDto testCase) {
    List<PistonExecuteRequest.FileContent> files = new ArrayList<>();

    String fileName = getFileName(language);
    files.add(new PistonExecuteRequest.FileContent(fileName, code));

    Integer timeout = testCase.getTimeout() != null ? testCase.getTimeout() : 5000;
    Long memoryLimit =
        testCase.getMemoryLimit() != null ? testCase.getMemoryLimit().longValue() * 1024 * 1024 : -1L;

    return new PistonExecuteRequest(
        language, "*", files, testCase.getInput(), timeout, timeout, memoryLimit);
  }
}
