package apsas.shared.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis Cache Configuration for APSAS Microservices.
 * <p>
 * Defines cache names, TTL policies, and serialization strategies for all services.
 * </p>
 */
@Configuration
@EnableCaching
public class CacheConfig {

  private static final String APSAS_PREFIX = "apsas:";
  private static final String IDENTITY_PREFIX = "apsas:identity:";
  private static final String CONTENT_PREFIX = "apsas:content:";
  private static final String SUBMISSION_PREFIX = "apsas:submission:";
  private static final String EVALUATION_PREFIX = "apsas:evaluation:";

  /**
   * Cache name for user entities. TTL: 30 minutes (users don't change frequently)
   */
  public static final String USERS_CACHE = "users";

  /**
   * Cache name for user lists by role. TTL: 15 minutes (role assignments may change)
   */
  public static final String USERS_BY_ROLE_CACHE = "usersByRole";

  /**
   * Cache name for assignments. TTL: 20 minutes (assignments are read-heavy after creation)
   */
  public static final String ASSIGNMENTS_CACHE = "assignments";

  /**
   * Cache name for skills reference data. TTL: 1 hour (skills are relatively static)
   */
  public static final String SKILLS_CACHE = "skills";

  /**
   * Cache name for all skills list. TTL: 1 hour (rarely changes)
   */
  public static final String ALL_SKILLS_CACHE = "allSkills";

  /**
   * Cache name for submissions. TTL: 10 minutes (may be updated with evaluation results)
   */
  public static final String SUBMISSIONS_CACHE = "submissions";

  /**
   * Cache name for tutorials. TTL: 1 hour (tutorial content is stable)
   */
  public static final String TUTORIALS_CACHE = "tutorials";

  /**
   * Cache name for supported runtimes. TTL: 1 hour (runtimes change infrequently)
   */
  public static final String RUNTIMES_CACHE = "runtimes";

  /**
   * Configures RedisCacheManager with specific TTL and serialization settings.
   */
  @Bean
  @ConditionalOnProperty(
      prefix = "spring.cache",
      name = "type",
      havingValue = "redis",
      matchIfMissing = true
  )
  public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
    var objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    objectMapper.activateDefaultTyping(
        LaissezFaireSubTypeValidator.instance,
        ObjectMapper.DefaultTyping.NON_FINAL
    );
    var jacksonSerializer = new Jackson2JsonRedisSerializer<>(objectMapper, Object.class);

    // Default cache configuration
    RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
        .entryTtl(Duration.ofMinutes(15)) // Default 15 minutes
        .disableCachingNullValues()
        .serializeKeysWith(RedisSerializationContext.SerializationPair
            .fromSerializer(new StringRedisSerializer()))
        .serializeValuesWith(RedisSerializationContext.SerializationPair
            .fromSerializer(jacksonSerializer))
        .prefixCacheNameWith(APSAS_PREFIX);

    // Per-cache configurations with specific TTLs
    Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();

    // Identity Service caches
    cacheConfigs.put(
        USERS_CACHE, defaultConfig
            .entryTtl(Duration.ofMinutes(30))
            .prefixCacheNameWith(IDENTITY_PREFIX)
    );

    cacheConfigs.put(
        USERS_BY_ROLE_CACHE, defaultConfig
            .entryTtl(Duration.ofMinutes(15))
            .prefixCacheNameWith(IDENTITY_PREFIX)
    );

    // Content Service caches
    cacheConfigs.put(
        ASSIGNMENTS_CACHE, defaultConfig
            .entryTtl(Duration.ofMinutes(20))
            .prefixCacheNameWith(CONTENT_PREFIX)
    );

    cacheConfigs.put(
        SKILLS_CACHE, defaultConfig
            .entryTtl(Duration.ofHours(1))
            .prefixCacheNameWith(CONTENT_PREFIX)
    );

    cacheConfigs.put(
        ALL_SKILLS_CACHE, defaultConfig
            .entryTtl(Duration.ofHours(1))
            .prefixCacheNameWith(CONTENT_PREFIX)
    );

    cacheConfigs.put(
        TUTORIALS_CACHE, defaultConfig
            .entryTtl(Duration.ofHours(1))
            .prefixCacheNameWith(CONTENT_PREFIX)
    );

    // Submission Service caches
    cacheConfigs.put(
        SUBMISSIONS_CACHE, defaultConfig
            .entryTtl(Duration.ofMinutes(10))
            .prefixCacheNameWith(SUBMISSION_PREFIX)
    );

    // Evaluation Service caches
    cacheConfigs.put(
        RUNTIMES_CACHE, defaultConfig
            .entryTtl(Duration.ofHours(1))
            .prefixCacheNameWith(EVALUATION_PREFIX)
    );

    return RedisCacheManager.builder(connectionFactory)
        .cacheDefaults(defaultConfig)
        .withInitialCacheConfigurations(cacheConfigs)
        .transactionAware()
        .build();
  }

  /**
   * Lightweight in-memory cache for integration tests or environments without Redis.
   */
  @Bean
  @ConditionalOnProperty(prefix = "spring.cache", name = "type", havingValue = "simple")
  public CacheManager inMemoryCacheManager() {
    return new ConcurrentMapCacheManager(
        USERS_CACHE,
        USERS_BY_ROLE_CACHE,
        ASSIGNMENTS_CACHE,
        SKILLS_CACHE,
        ALL_SKILLS_CACHE,
        SUBMISSIONS_CACHE,
        TUTORIALS_CACHE,
        RUNTIMES_CACHE
    );
  }
}
