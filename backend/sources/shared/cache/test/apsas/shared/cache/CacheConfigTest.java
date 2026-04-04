package apsas.shared.cache;

import org.junit.jupiter.api.Test;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class CacheConfigTest {

  private final CacheConfig cacheConfig = new CacheConfig();

  @Test
  void should_createInMemoryCacheManager_withAllConfiguredCaches() {
    CacheManager cacheManager = cacheConfig.inMemoryCacheManager();

    assertNotNull(cacheManager);
    assertNotNull(cacheManager.getCache(CacheConfig.USERS_CACHE));
    assertNotNull(cacheManager.getCache(CacheConfig.USERS_BY_ROLE_CACHE));
    assertNotNull(cacheManager.getCache(CacheConfig.ASSIGNMENTS_CACHE));
    assertNotNull(cacheManager.getCache(CacheConfig.SKILLS_CACHE));
    assertNotNull(cacheManager.getCache(CacheConfig.ALL_SKILLS_CACHE));
    assertNotNull(cacheManager.getCache(CacheConfig.SUBMISSIONS_CACHE));
    assertNotNull(cacheManager.getCache(CacheConfig.TUTORIALS_CACHE));
    assertNotNull(cacheManager.getCache(CacheConfig.RUNTIMES_CACHE));
  }

  @Test
  void should_createRedisCacheManager_withPerCacheConfigurations() {
    RedisCacheManager cacheManager =
        cacheConfig.cacheManager(new LettuceConnectionFactory("localhost", 6379));

    assertNotNull(cacheManager);
    assertNotNull(cacheManager.getCache(CacheConfig.ASSIGNMENTS_CACHE));
    assertNotNull(cacheManager.getCache(CacheConfig.SKILLS_CACHE));
    assertNotNull(cacheManager.getCache(CacheConfig.TUTORIALS_CACHE));
  }
}

