package apsas.support.helper

import apsas.support.model.dto.CreateSupportSessionRequest

object TestDataFactory {
    fun createSupportSessionRequest(initialMessage: String = "I need help with my assignment"): CreateSupportSessionRequest =
        CreateSupportSessionRequest(initialMessage)
}
