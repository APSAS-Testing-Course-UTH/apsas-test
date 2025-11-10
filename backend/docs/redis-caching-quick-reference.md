# APSAS Redis Caching - Quick Reference

## Cache Constants (Import from `apsas.shared.cache.CacheConfig`)

```java
CacheConfig.USERS_CACHE              // 30 min TTL
CacheConfig.USERS_BY_ROLE_CACHE      // 15 min TTL
CacheConfig.ASSIGNMENTS_CACHE        // 20 min TTL
CacheConfig.SKILLS_CACHE             // 1 hour TTL
CacheConfig.ALL_SKILLS_CACHE         // 1 hour TTL
CacheConfig.TUTORIALS_CACHE          // 1 hour TTL
CacheConfig.SUBMISSIONS_CACHE        // 10 min TTL
```

## Common Annotations

### Read (Cache-Aside)

```java

@Cacheable(value = CacheConfig.CACHE_NAME, key = "#id", unless = "#result == null")
public EntityDto getById(UUID id) { ...}
```

### Update (Write-Through)

```java

@CachePut(value = CacheConfig.CACHE_NAME, key = "#id")
public EntityDto update(UUID id, UpdateDto dto) { ...}
```

### Delete (Evict Single Entry)

```java

@CacheEvict(value = CacheConfig.CACHE_NAME, key = "#id")
public void delete(UUID id) { ...}
```

### Evict All Entries

```java

@CacheEvict(value = CacheConfig.CACHE_NAME, allEntries = true)
public void bulkUpdate() { ...}
```

### Multiple Cache Operations

```java

@CachePut(value = CacheConfig.SKILLS_CACHE, key = "#id")
@CacheEvict(value = CacheConfig.ALL_SKILLS_CACHE, allEntries = true)
public SkillDto updateSkill(UUID id, UpdateDto dto) { ...}
```

## Service Module Setup

### 1. Add dependency in `module.yaml`

```yaml
dependencies:
  - ../../shared/cache
```

### 2. Import Redis config in `config/<service>.yaml`

```yaml
spring:
  config:
    import:
      - file:./config/fragments/redis.yaml
```

### 3. Add cache imports in service class

```java
import apsas.shared.cache.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.CacheEvict;
```

## Docker Commands

```bash
# Start Redis
docker compose -f docker-compose.dev.yaml up -d redis

# Connect to Redis CLI
docker exec -it apsas-redis redis-cli

# View all cache keys
KEYS apsas:*

# View specific service caches
KEYS apsas:identity:*
KEYS apsas:content:*
KEYS apsas:submission:*

# Get cache value
GET apsas:identity:users:<uuid>

# Clear all caches
FLUSHDB

# Clear specific pattern
EVAL "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" 0 apsas:content:*
```

## Environment Variables

```bash
# Default values
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Cache Key Patterns

```
apsas:identity:users:<userId>
apsas:identity:usersByRole:<role>
apsas:content:assignments:<assignmentId>
apsas:content:skills:<skillId>
apsas:content:allSkills:<page>:<size>
apsas:submission:submissions:<submissionId>
```

## When to Cache

✅ **DO Cache:**

- Frequently read, rarely updated (users, skills, tutorials)
- Expensive database queries
- External API responses
- Reference data

❌ **DON'T Cache:**

- Constantly changing data
- User-specific data (unless session-based)
- Large objects (>1MB)
- Sensitive data requiring real-time accuracy

## TTL Selection Guide

| Update Frequency  | Recommended TTL |
|-------------------|-----------------|
| Never/Rarely      | 1-2 hours       |
| Daily             | 30-60 minutes   |
| Hourly            | 10-15 minutes   |
| Every few minutes | 2-5 minutes     |
| Constantly        | Don't cache     |

## Troubleshooting Checklist

- [ ] Redis container running? `docker ps | grep redis`
- [ ] Service imports `shared/cache` module?
- [ ] Config imports `redis.yaml` fragment?
- [ ] `@Cacheable` annotation on method?
- [ ] Correct cache name constant used?
- [ ] Cache key expression valid?
- [ ] Method return type serializable?
- [ ] TTL appropriate for data volatility?
