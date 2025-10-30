package apsas.evaluation.model;

import java.util.List;

public record AssignmentDto(String[] languages, List<TestCaseDto> testCases) {}
