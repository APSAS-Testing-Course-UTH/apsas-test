package apsas.shared.security;

import lombok.experimental.UtilityClass;

/** Các claim được sử dụng trong JWT. */
@UtilityClass
public final class JwtClaims {
  public static final String USER_ID = "user_id";
  public static final String EMAIL = "email";
  public static final String ROLE = "role";
  public static final String FIRST_NAME = "first_name";
  public static final String LAST_NAME = "last_name";
  public static final String IS_ACTIVE = "is_active";
}
