## Allure JUnit 5 reference

These are the functions that you can use to integrate your JUnit 5 tests with Allure.

Allure JUnit 5 provides more than one way to use some features. In most cases, one way involves using an annotation on the test method, while the other involves a method call inside the test method body. The latter style is called “dynamic” and allows to construct values dynamically.

Assign a test's [description, links and other metadata](https://allurereport.org/docs/v2/readability/#description-links-and-other-metadata).

Set the test's [title](https://allurereport.org/docs/v2/readability/#title).

Unlike most of the functions described here, the `@DisplayName` annotation is a part of JUnit 5 itself.

If you need to construct a test's title dynamically, write a lambda function that does that and pass it to the `updateTestCase()` method of the `AllureLifecycle` object, see the example below.

```java
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    @DisplayName("Test Authentication")
    void testAuthentication() {
        // ...
    }
}
```

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthentication() {
        Allure.getLifecycle().updateTestCase(result -> {
            result.setName("Test Authentication");
        });
        // ...
    }
}
```

### Description

- `@Description(String value="", boolean useJavaDoc=false)`
- `Allure.description(String description)`

Set the test's [description](https://allurereport.org/docs/v2/readability/#description).

Use the `@Description()` annotation to set a description statically or use the `description()` method to set it dynamically in runtime.

```java
import io.qameta.allure.Description;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    @Description("This test attempts to log into the website using a login and a password. Fails if any error happens.\n\nNote that this test does not test 2-Factor Authentication.")
    void testAuthentication() {
        // ...
    }
}
```

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthentication() {
        Allure.description("This test attempts to log into the website using a login and a password. Fails if any error happens.\n\nNote that this test does not test 2-Factor Authentication.");
        // ...
    }
}
```

Alternatively, you can let Allure JUnit 5 parse the description from the test method's JavaDoc comment. To do so, first add a special annotation processor to your project's Maven or Gradle configuration.

```kotlin
kotlin// In the project's `build.gradle.kts`

val allureVersion = "2.32.0"

dependencies {
    // ...
    testAnnotationProcessor("io.qameta.allure:allure-descriptions-javadoc:$allureVersion")
}
```

Then, use the Annotations API with the `useJavaDoc=true` argument on the test methods for which you want to parse the description from JavaDoc. Note that on a large project, processing the annotations may significantly increase both the compilation time and the file size of the test executable files.

Markdown formatting is allowed. Any HTML formatting, if present, will be stripped for security purposes.

```java
import io.qameta.allure.Description;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    /**
     * This test attempts to log into the website using a login and a password. Fails if any error happens.
     * <p>
     * Note that this test does not test 2-Factor Authentication.
     */
    @Test
    @Description(useJavaDoc = true)
    void testAuthentication() {
        // ...
    }
}
```

### Owner

- `@Owner(String value="")`

Set the test's [owner](https://allurereport.org/docs/v2/readability/#owner).

```java
import io.qameta.allure.Owner;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    @Owner("John Doe")
    void testAuthentication() {
        // ...
    }
}
```

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthentication() {
        Allure.label("owner", "John Doe");
        // ...
    }
}
```

### Tag

- `@Tag(String value)`
- `@Tags(Tag[] value)`

Set the test's [tags](https://allurereport.org/docs/v2/readability/#tags).

```java
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    @Tag("NewUI")
    @Tag("Essentials")
    @Tag("Authentication")
    void testAuthentication() {
        // ...
    }
}
```

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthentication() {
        Allure.label("tag", "NewUI");
        Allure.label("tag", "Essentials");
        Allure.label("tag", "Authentication");
        // ...
    }
}
```

### Severity

- `@Severity(SeverityLevel value)`

Set the test's [severity](https://allurereport.org/docs/v2/readability/#severity).

Allowed values are: “trivial”, “minor”, “normal”, “critical”, and “blocker”.

```java
import io.qameta.allure.Severity;
import org.junit.jupiter.api.Test;

import static io.qameta.allure.SeverityLevel.*;

class TestMyWebsite {

    @Test
    @Severity(CRITICAL)
    void testAuthentication() {
        // ...
    }
}
```

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthentication() {
        Allure.label("severity", "critical");
        // ...
    }
}
```

### Label

- `@LabelAnnotation(String name, String value=DEFAULT_VALUE)`
- `Allure.label(String name, String value)`

Set an arbitrary [label](https://allurereport.org/docs/v2/readability/#other-labels) for the test. This is the underlying implementation for a lot of Allure's other functions.

To set a label dynamically, just call the `label()` function with a name and a value for a label. You can do it multiple times to create an array of values under that name.

Another way of setting a label is to create a custom class using `@LabelAnnotation` and annotate the tests with the new annotation, see the example below. Please be careful to copy `@Retention`, `@Target` and the other necessary annotations as this is shown in the example, otherwise you custom annotation may not work properly.

```java
import io.qameta.allure.LabelAnnotation;
import org.junit.jupiter.api.Test;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
@LabelAnnotation(name = "CustomLabelName")
@interface MyLabel {
    String value();
}

class TestMyWebsite {

    @Test
    @MyLabel("custom label value")
    void testAuthentication() {
        // ...
    }
}
```

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthentication() {
        Allure.label("language", "java");
        Allure.label("framework", "junit5");
        Allure.label("CustomLabelName", "custom label value");
        // ...
    }
}
```

### Allure ID (Allure TestOps)

- `@AllureId(String value)`

Set the test's [ID](https://allurereport.org/docs/v2/readability/#id).

```java
import io.qameta.allure.AllureId;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    @AllureId("123")
    void testAuthentication() {
        // ...
    }
}
```

### Link

- `@Link(String value="", name="", String url="", String type=CUSTOM_LINK_TYPE)`
- `@Links(Link[] value)`
- `@Issue(String value="")`
- `@Issues(Issue[] value)`
- `@TmsLink(String value="")`
- `@TmsLinks(TmsLink[] value)`
- `Allure.link(String url)`
- `Allure.link(String name, String url)`
- `Allure.link(String name, String type, String url)`
- `Allure.issue(String name, String url)`
- `Allure.tms(String name, String url)`

Add a [link](https://allurereport.org/docs/v2/readability/#links) related to the test.

Based on the `type` (which can be any string), Allure will try to load a corresponding **link pattern** to process the URL, as defined by the [`allure.link.*.pattern`](https://allurereport.org/docs/junit5-configuration/#allure-link-%E2%9F%A8type%E2%9F%A9-pattern) configuration option. If no pattern found for the given type, the URL is left unmodified.

The `name` will be used as the link's text. If it is omitted, the unprocessed URL will be used instead.

For convenience, Allure provides two shorthand functions with pre-selected link types: `issue()` and `tms()`.

```java
import io.qameta.allure.Issue;
import io.qameta.allure.Link;
import io.qameta.allure.TmsLink;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    @Link(name = "Website", url = "https://dev.example.com/")
    @Issue("AUTH-123")
    @TmsLink("TMS-456")
    void testAuthentication() {
        // ...
    }
}
```

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthentication() {
        Allure.link("Website", "https://dev.example.com/");
        Allure.issue("AUTH-123", "https://jira.example.org/browse/AUTH-123");
        Allure.tms("TMS-456", "https://tms.example.org/TMS-456");
        // ...
    }
}
```

## Behavior-based hierarchy

- `@Epic(String value="")`
- `@Epics(Epic[] value)`
- `@Feature(String value="")`
- `@Features(Feature[] value)`
- `@Story(String value="")`
- `@Stories(Story[] value)`
- `Allure.epic(String value)`
- `Allure.feature(String value)`
- `Allure.story(String value)`

Assign names of **epics**, **features** or **user stories** for a test, as part of Allure's [behavior-based hierarchy](https://allurereport.org/docs/v2/navigation/#behavior-based-hierarchy).

```java
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    @Epic("Web interface")
    @Feature("Essential features")
    @Story("Authentication")
    void testAuthentication() {
        // ...
    }
}
```

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthentication() {
        Allure.epic("Web interface");
        Allure.feature("Essential features");
        Allure.story("Authentication");
        // ...
    }
}
```

## Suite-based hierarchy

- `Allure.suite(String value)`

Assign the name of suite, as part of Allure's [suite-based hierarchy](https://allurereport.org/docs/v2/navigation/#suite-based-hierarchy).

To assign names of parent suite or sub-suite, use [`label()`](https://allurereport.org/docs/junit5-reference/#label) with the corresponding label names.

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthentication() {
        Allure.label("parentSuite" "Tests for web interface");
        Allure.suite("Tests for essential features");
        Allure.label("subSuite", "Tests for authentication");
        // ...
    }
}
```

## Test steps

- `@Step(String value="")`
- `Allure.step(String name)`
- `Allure.step(String name, Status status)`
- `Allure.step(String name, ThrowableRunnableVoid runnable)`
- `Allure.step(String name, ThrowableRunnable<T> runnable)`
- `Allure.step(ThrowableContextRunnableVoid<StepContext> runnable)`
- `Allure.step(String name, ThrowableContextRunnableVoid<StepContext> runnable)`
- `Allure.step(String name, ThrowableContextRunnable<T, StepContext> runnable)`
- `Allure.step(ThrowableContextRunnable<T, StepContext> runnable)`

Define a [test step](https://allurereport.org/docs/steps/) with the given `name`.

There are three ways of defining a step.

- “An annotated step”: define a method containing a test step and decorate it with `@Step()`.
- “A lambda step”: write a test step in a lambda function and pass it to `Allure.step()`.
- “A no-op step”: just pass a `name` and an optional `status` to `Allure.step()` to immediately add a corresponding entry to the results as a sub-step of the current step.

When you are implementing a function for a lambda step, it can accept either no arguments or a single argument of class `StepContext`. This object provides the following methods:

- `name()` — override the step name during its execution.
- `parameter()` — indicate arbitrary parameters used for the step. The available signatures of this method are the same as for the test-wide implementation, see [Parametrized tests](https://allurereport.org/docs/junit5-reference/#parametrized-tests).

```java
import io.qameta.allure.Step;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthentication() {
        step1();
        step2();
    }

    @Step("Step 1")
    void step1() {
        subStep1();
        subStep2();
    }

    @Step("Sub-step 1")
    void subStep1() {
        // ...
    }

    @Step("Sub-step 2")
    void subStep2() {
        // ...
    }

    @Step("Step 2")
    void step2() {
        // ...
    }
}
```

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthentication() {

        Allure.step("Step 1", step -> {

            // ...
            Allure.step("Sub-step 1");

            // ...
            Allure.step("Sub-step 2");
        });

        Allure.step("Step 2", step -> {
            // ...
        });
    }
}
```

## Parametrized tests

- `@Param(String value="", String name="", Parameter.Mode mode=DEFAULT, boolean excluded=false)`
- `Allure.parameter(String name, T value)`
- `Allure.parameter(String name, T value, Boolean excluded)`
- `Allure.parameter(String name, T value, Parameter.Mode mode)`
- `Allure.parameter(String name, T value, Boolean excluded, Parameter.Mode mode)`

Specify a `name` and `value` of a parameter that was used during this test. This can be used for adding the parameters even to those function that do not use the `@ParameterizedTest()` decorator. See [Parametrized tests](https://allurereport.org/docs/v2/readability/#parametrized-tests) for more details.

WARNING

Allure JUnit 5 identifies tests based only on their names and static parameters, such as the ones defined via `@ValueSource`. If you have multiple tests that only differ in dynamic parameters (i.e., the `Allure.parameter()` calls), they will be treated as one test for the purposes of [History and retries](https://allurereport.org/docs/history-and-retries/).

If the `excluded` argument is set to true, Allure will not use the parameter when comparing the current test result with previous one in the history. This argument is only used by Allure TestOps.

The `mode` argument affects how the parameter will be displayed in the report. Available options are defined in the `Parameter.Mode` enumeration:

- `Parameter.Mode.DEFAULT` (same as not specifying any mode) — the parameter and its value will be shown in a table along with other parameters.
- `Parameter.Mode.MASKED` — the parameter will be shown in the table, but its value will be hidden. Use this mode for passwords, tokens and other sensitive parameters.
- `Parameter.Mode.HIDDEN` — the parameter and its value will not be shown in the test report. Note, however, that it is still possible to extract the value from the `allure_results` directory if you publish it.

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class TestMyWebsite {

    @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
    @ValueSource(strings = {"johndoe", "johndoe@example.com"})
    void testAuthentication(String login) {
        // ...
    }
}
```

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

class TestMyWebsite {

    @Test
    void testAuthenticationWithUsername() {
        Allure.parameter("login", "johndoe");
        // ...
    }

    @Test
    void testAuthenticationWithEmail() {
        Allure.parameter("login", "johndoe@example.com");
        // ...
    }
}
```

Note that by default, the Java runtime does not have access to the names of method arguments. This means that the Annotations API can only display pseudo-names like “arg0”, “arg1”, etc. To let it display the original names in the report, add `-parameters` into your project's `compilerArgs`. For example (in the project's `build.gradle.kts`):

```kotlin
kotlintasks.withType(JavaCompile::class) {
    options.compilerArgs.add("-parameters")
}
```

## Attachments

- `@Attachment(String value="", String type="", String fileExtension="")`
- `Allure.addAttachment(String name, String content)`
- `Allure.addAttachment(String name, String type, String content)`
- `Allure.addAttachment(String name, String type, String content, String fileExtension)`
- `Allure.addAttachment(String name, InputStream content)`
- `Allure.addAttachment(String name, String type, InputStream content, String fileExtension)`
- `Allure.attachment(String name, String content)`
- `Allure.attachment(String name, InputStream content)`

Add `content` as an [attachment](https://allurereport.org/docs/attachments/) to the test result under the given `name` (defaults to a unique pseudo-random string).

TIP

You can use data produced by any function, not necessarily read from an actual file.

To create an attachment using the Annotations API, define a method that returns some data and annotate it with `@Attachment`. Call the method at any point during your test.

To create an attachment using the Runtime API, just call `addAttachment()` or `attachment()` at any point during your test. Pass the data as the `content` argument.

The data will be processed as following:

- If the data type is `byte[]`, Allure will use it without modification.
- If the data type is `String`, Allure will convert it to `byte[]`.
- If the data is of any other type, Allure will call the `toString()` method and then convert the string to `byte[]`.

To ensure that the reader's web browser will display attachments correctly, it is recommended to specify each attachment's type. To do so, pass the media type of the content as `type` and, optionally, a filename extension as `fileExtension`. The media type affects how the data will be displayed in the test report, while the filename extension is appended to the filename when user wants to save the file.

```java
import io.qameta.allure.Attachment;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

class TestMyWebsite {

    @Test
    void testAuthentication() throws IOException {
        // ...
        attachDataTXT();
        attachScreenshotPNG();
    }

    @Attachment(value = "data", type = "text/plain", fileExtension = ".txt")
    public String attachDataTXT() {
        return "This is the file content.";
    }

    @Attachment(value = "screenshot", type = "image/png", fileExtension = ".png")
    public byte[] attachScreenshotPNG() throws IOException {
        return Files.readAllBytes(Paths.get("/path/to/image.png"));
    }
}
```

```java
import io.qameta.allure.Allure;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

class TestMyWebsite {

    @Test
    void testAuthentication() throws IOException {
        // ...
        Allure.attachment("data.txt", "This is the file content.");
        try (InputStream is = Files.newInputStream(Paths.get("/path/img.png"))) {
            Allure.attachment("image.png", is);
        }
    }
}
```

INFO

Additionally, Allure provides a way to spawn threads that will add attachments to the test results asynchronously without blocking the test runner. While not recommended for the majority of cases, this approach can improve tests that otherwise have to wait for processing very large files, such as videos larger than 1 GB. Please refer to the source code for `Allure.addByteAttachmentAsync()` and `Allure.addStreamAttachmentAsync()` to learn more.

Additionally, you can consult our guides for integrating screenshots in JUnit5 with Allure Report:

- [Integrating screenshots in JUnit5 and Selenide](https://allurereport.org/docs/guides/junit5-selenide-screenshots/)
- [Integrating screenshots in JUnit5 and Selenium](https://allurereport.org/docs/guides/junit5-selenium-screenshots/)

## Results history

### Flaky

- `@Flaky`

Indicate that the test is known to be unstable and can may not succeed every time. See [Flaky tests](https://allurereport.org/docs/test-stability/#flaky-tests).
