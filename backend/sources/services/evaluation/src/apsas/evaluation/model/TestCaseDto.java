package apsas.evaluation.model;

/** DTO for Test Case details */
public record TestCaseDto(
    Integer order,
    String description,
    Boolean hidden,
    Double weight,
    String input,
    String output,
    Integer timeout,
    Integer memoryLimit) {}
