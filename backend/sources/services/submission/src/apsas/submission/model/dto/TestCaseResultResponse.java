package apsas.submission.model.dto;

public class TestCaseResultResponse {
  private Integer order;
  private String description;
  private Boolean hidden;
  private Double weight;
  private String input;
  private String output;
  private Integer timeout;
  private Integer memoryLimit;
  private Boolean passed;
  private String actualOutput;
  private String errorMessage;
  private Double executionTime;
  private Double memoryUsed;

  // Getters and Setters
  public Integer getOrder() {
    return order;
  }

  public void setOrder(Integer order) {
    this.order = order;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Boolean getHidden() {
    return hidden;
  }

  public void setHidden(Boolean hidden) {
    this.hidden = hidden;
  }

  public Double getWeight() {
    return weight;
  }

  public void setWeight(Double weight) {
    this.weight = weight;
  }

  public String getInput() {
    return input;
  }

  public void setInput(String input) {
    this.input = input;
  }

  public String getOutput() {
    return output;
  }

  public void setOutput(String output) {
    this.output = output;
  }

  public Integer getTimeout() {
    return timeout;
  }

  public void setTimeout(Integer timeout) {
    this.timeout = timeout;
  }

  public Integer getMemoryLimit() {
    return memoryLimit;
  }

  public void setMemoryLimit(Integer memoryLimit) {
    this.memoryLimit = memoryLimit;
  }

  public Boolean getPassed() {
    return passed;
  }

  public void setPassed(Boolean passed) {
    this.passed = passed;
  }

  public String getActualOutput() {
    return actualOutput;
  }

  public void setActualOutput(String actualOutput) {
    this.actualOutput = actualOutput;
  }

  public String getErrorMessage() {
    return errorMessage;
  }

  public void setErrorMessage(String errorMessage) {
    this.errorMessage = errorMessage;
  }

  public Double getExecutionTime() {
    return executionTime;
  }

  public void setExecutionTime(Double executionTime) {
    this.executionTime = executionTime;
  }

  public Double getMemoryUsed() {
    return memoryUsed;
  }

  public void setMemoryUsed(Double memoryUsed) {
    this.memoryUsed = memoryUsed;
  }
}
