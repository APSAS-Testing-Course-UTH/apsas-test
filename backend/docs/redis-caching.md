# Redis Caching Implementation for APSAS

## Overview

This document describes the Redis caching strategy implemented across the APSAS microservices to
improve performance and reduce database load.

## Architecture

### Technology Stack

- **Cache Provider**: Redis 8.2 (Alpine)
- **Spring Integration**: Spring Boot Starter Data Redis + Spring Boot Starter Cache
- **Serialization**: Jackson2JsonRedisSerializer for values, StringRedisSerializer for keys
- **Connection Pool**: Lettuce with connection pooling

### Cache Configuration Location

- **Shared Module**: `sources/shared/cache/`
- **Configuration Class**: `apsas.shared.cache.CacheConfig`
- **Config Fragments**: `config/fragments/redis.yaml` and `redis-dev.yaml`

## Cache Names and TTL Policies

| Cache Name    | Constant                          | TTL    | Service    | Purpose                                 |
|---------------|-----------------------------------|--------|------------|-----------------------------------------|
| `users`       | `CacheConfig.USERS_CACHE`         | 30 min | Identity   | Individual user data by ID              |
| `usersByRole` | `CacheConfig.USERS_BY_ROLE_CACHE` | 15 min | Identity   | Lists of users grouped by role          |
| `assignments` | `CacheConfig.ASSIGNMENTS_CACHE`   | 20 min | Content    | Assignment details by ID                |
| `skills`      | `CacheConfig.SKILLS_CACHE`        | 1 hour | Content    | Individual skill data                   |
| `allSkills`   | `CacheConfig.ALL_SKILLS_CACHE`    | 1 hour | Content    | Paginated skill lists                   |
| `tutorials`   | `CacheConfig.TUTORIALS_CACHE`     | 1 hour | Content    | Tutorial content                        |
| `submissions` | `CacheConfig.SUBMISSIONS_CACHE`   | 10 min | Submission | Submission details (updated frequently) |

### Key Prefixes

All cache keys are prefixed with `apsas:<service>:` pattern:

- `apsas:identity:users:...`
- `apsas:content:assignments:...`
- `apsas:submission:submissions:...`

## Cached Methods

### Identity Service (`UserService`)

#### Read Operations

```java

@Cacheable(value = CacheConfig.USERS_CACHE, key = "#userId")
public UserResponse getUserById(UUID userId)
```

- **Cache Key**: `userId`
- **TTL**: 30 minutes
- **Eviction**: When user is updated/deleted

```java

@Cacheable(value = CacheConfig.USERS_BY_ROLE_CACHE, key = "#role")
public List<UserResponse> getUsersByRole(UserRole role)
```

- **Cache Key**: `role` enum value
- **TTL**: 15 minutes
- **Eviction**: When new user is created or role changes

#### Write Operations

```java

@CachePut(value = CacheConfig.USERS_CACHE, key = "#userId")
public UserResponse updateProfile(UUID userId, UpdateProfileRequest request)
```

- Updates cache with new user data

```java

@CacheEvict(value = CacheConfig.USERS_BY_ROLE_CACHE, allEntries = true)
public UserResponse createUser(CreateUserRequest request)
```

- Evicts all role-based caches (role of new user unknown)

### Content Service

#### `AssignmentService`

```java

@Cacheable(value = CacheConfig.ASSIGNMENTS_CACHE, key = "#id")
public AssignmentResponse getAssignmentById(UUID id)
```

- **Cache Key**: Assignment UUID
- **TTL**: 20 minutes
- **Rationale**: Assignments are read-heavy after creation/publication

#### `SkillService`

```java

@Cacheable(value = CacheConfig.SKILLS_CACHE, key = "#id")
public SkillResponse getSkillById(UUID id)
```

- **Cache Key**: Skill UUID
- **TTL**: 1 hour
- **Rationale**: Skills are reference data, rarely change

```java

@CachePut(value = CacheConfig.SKILLS_CACHE, key = "#id")
@CacheEvict(value = CacheConfig.ALL_SKILLS_CACHE, allEntries = true)
public SkillResponse updateSkill(UUID id, UpdateSkillRequest request)
```

- Updates individual skill cache
- Evicts paginated lists (since order/content changed)

```java

@CacheEvict(value = {CacheConfig.SKILLS_CACHE, CacheConfig.ALL_SKILLS_CACHE}, allEntries = true)
public void deleteSkill(UUID id)
```

- Evicts both individual and list caches

### Submission Service (`SubmissionService`)

```java

@Cacheable(value = CacheConfig.SUBMISSIONS_CACHE, key = "#id")
public SubmissionResponse getSubmissionById(UUID id, UUID studentId, boolean isInstructor)
```

- **Cache Key**: Submission UUID
- **TTL**: 10 minutes
- **Rationale**: Submissions are frequently accessed for feedback but updated when evaluated

```java

@CacheEvict(value = CacheConfig.SUBMISSIONS_CACHE, key = "#submissionId")
public void handleSubmissionEvaluated(...)
```

- Evicts cache when evaluation completes (status/score changes)

```java

@CachePut(value = CacheConfig.SUBMISSIONS_CACHE, key = "#submissionId")
public SubmissionResponse provideFeedback(UUID submissionId, String feedback)
```

- Updates cache with instructor feedback

## Configuration

### Application Configuration

**Location**: `config/fragments/redis.yaml`

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
  cache:
    type: redis
    redis:
      time-to-live: 900000  # 15 min default
      cache-null-values: false
      use-key-prefix: true
```

### Development Environment

**Docker Compose**: `docker-compose.dev.yaml`

```yaml
redis:
  image: redis:8.2-alpine
  command: redis-server --appendonly yes
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

### Service Configuration

Services import Redis fragment in their YAML:

```yaml
# identity-service.yaml, content-service.yaml, submission-service.yaml
spring:
  config:
    import:
      - file:./config/fragments/redis.yaml
```

## Cache Patterns

### 1. Cache-Aside (Read-Through)

Used for read-heavy operations:

```java

@Cacheable(value = "cacheName", key = "#id")
public Entity getById(UUID id) {
  return repository.findById(id).orElseThrow();
}
```

### 2. Write-Through

Updates cache on write:

```java

@CachePut(value = "cacheName", key = "#id")
public Entity update(UUID id, UpdateRequest request) {
  // Update database
  return updatedEntity;
}
```

### 3. Write-Invalidate

Evicts cache on complex updates:

```java

@CacheEvict(value = "cacheName", allEntries = true)
public void bulkUpdate() {
  // Update database
}
```

## Monitoring and Management

### Redis CLI Commands

```bash
# Connect to Redis
docker exec -it apsas-redis redis-cli

# View all cache keys
KEYS apsas:*

# View specific cache
KEYS apsas:identity:users:*

# Get TTL for a key
TTL apsas:identity:users:some-uuid

# Get cache value
GET apsas:identity:users:some-uuid

# Clear all caches (use with caution!)
FLUSHDB

# Clear specific pattern
EVAL "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" 0 apsas:content:*
```

### Cache Statistics

Spring Boot Actuator can expose cache metrics (if enabled):

```yaml
management:
  endpoints:
    web:
      exposure:
        include: caches,metrics
```

Access: `GET /actuator/caches`

## Performance Considerations

### Cache Hit Ratio

- **Target**: >80% for frequently accessed data
- **Monitor**: User lookups, skill reference data, assignment views

### Memory Usage

- **Estimated**: ~10-50 MB per service under normal load
- **Monitor**: Redis memory usage via `INFO memory`

### Network Latency

- **Local**: <1ms (same machine)
- **Production**: <5ms (same datacenter)

## Best Practices

### 1. Cache Keys

- Use UUIDs or composite keys
- Keep keys short but descriptive
- Use consistent naming: `service:entity:id`

### 2. TTL Selection

- **Static data** (skills, tutorials): 1 hour
- **User data**: 15-30 minutes
- **Frequently updated** (submissions): 5-10 minutes

### 3. Eviction Strategy

- **Single update**: Use `@CachePut` to update cache
- **Complex update**: Use `@CacheEvict` to invalidate
- **Bulk operations**: Evict all entries

### 4. Null Handling

- `unless = "#result == null"` prevents caching null responses
- `disableCachingNullValues()` in global config

### 5. Conditional Caching

```java
@Cacheable(value = "cache", condition = "#param > 0")
@Cacheable(value = "cache", unless = "#result.size() == 0")
```

## Troubleshooting

### Cache Not Working

1. Check Redis is running: `docker ps | grep redis`
2. Verify connection: `redis-cli ping`
3. Check `@EnableCaching` on `CacheConfig`
4. Ensure service imports `shared/cache` module

### Stale Data

1. Check TTL is appropriate
2. Verify eviction annotations on update methods
3. Consider reducing TTL for frequently changing data

### Memory Issues

1. Monitor Redis memory: `redis-cli INFO memory`
2. Set maxmemory policy: `maxmemory-policy allkeys-lru`
3. Reduce TTLs for less critical caches

## Future Enhancements

1. **Redis Cluster**: For production scalability
2. **Cache Warming**: Pre-populate caches on startup
3. **Pub/Sub Invalidation**: Cross-service cache invalidation via RabbitMQ
4. **Distributed Sessions**: Store user sessions in Redis
5. **Rate Limiting**: Use Redis for API rate limiting
6. **Multi-level Cache**: Add Caffeine (local) cache before Redis

## References

- [Spring Data Redis Documentation](https://docs.spring.io/spring-data/redis/reference/)
- [Spring Cache Abstraction](https://docs.spring.io/spring-framework/reference/integration/cache.html)
- [Redis Best Practices](https://redis.io/docs/latest/develop/use/patterns/)
