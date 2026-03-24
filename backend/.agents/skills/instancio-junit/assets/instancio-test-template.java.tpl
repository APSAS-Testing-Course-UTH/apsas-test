import static org.assertj.core.api.Assertions.assertThat;

import org.instancio.Instancio;
import org.instancio.Select;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ${TEST_CLASS_NAME} {

    @Test
    @DisplayName("${DISPLAY_NAME}")
    void ${TEST_METHOD_NAME}() {
        // Arrange
        ${ROOT_TYPE} input = Instancio.of(${ROOT_TYPE}.class)
            ${CUSTOMIZATIONS}
            .create();

        // Act
        ${ACT_STATEMENT}

        // Assert
        ${ASSERT_STATEMENTS}
    }
}
