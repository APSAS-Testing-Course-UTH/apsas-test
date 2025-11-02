package apsas.shared.test

import apsas.shared.security.UserPrincipal
import apsas.shared.security.UserPrincipals
import org.springframework.test.web.reactive.server.WebTestClient
import java.util.UUID
import kotlin.jvm.optionals.getOrNull

val P_ADMIN =
    UserPrincipal(
        UUID.fromString("00000000-0000-0000-0000-000000000001"),
        "admin@apsas",
        "Admin",
        "User",
        "ADMIN",
        true,
    )

val P_CONTENT_PROVIDER =
    UserPrincipal(
        UUID.fromString("00000000-0000-0000-0000-000000000002"),
        "provider@apsas",
        "Content",
        "Provider",
        "CONTENT_PROVIDER",
        true,
    )

val P_INSTRUCTOR =
    UserPrincipal(
        UUID.fromString("00000000-0000-0000-0000-000000000003"),
        "instructor@apsas",
        "Instructor",
        "User",
        "INSTRUCTOR",
        true,
    )

val P_STUDENT =
    UserPrincipal(
        UUID.fromString("00000000-0000-0000-0000-000000000004"),
        "student@apsas",
        "Student",
        "User",
        "STUDENT",
        true,
    )

val P_OTHER_INSTRUCTOR =
    UserPrincipal(
        UUID.fromString("00000000-0000-0000-0000-000000000005"),
        "other_instructor@apsas",
        "Other",
        "Instructor",
        "INSTRUCTOR",
        true,
    )

val P_OTHER_STUDENT =
    UserPrincipal(
        UUID.fromString("00000000-0000-0000-0000-000000000006"),
        "other_student@apsas",
        "Other",
        "Student",
        "STUDENT",
        true,
    )

fun <T : WebTestClient.RequestHeadersSpec<T>> WebTestClient.RequestHeadersSpec<T>.withPrincipal(principal: UserPrincipal) =
    this.header(UserPrincipals.USER_INFO_HEADER, UserPrincipals.toBase64(principal).getOrNull())

fun UserPrincipal.withId(id: UUID): UserPrincipal =
    UserPrincipal(
        id,
        this.email,
        this.firstName,
        this.lastName,
        this.role,
        this.isActive,
    )
