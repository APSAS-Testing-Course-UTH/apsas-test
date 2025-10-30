package apsas.evaluation.model.dto;

/** Response model from Piston API execute endpoint */
public record PistonExecuteResponse(
    String language, String version, ExecutionResult run, ExecutionResult compile) {
  public record ExecutionResult(
      String stdout, String stderr, String output, Integer code, String signal) {}
}
