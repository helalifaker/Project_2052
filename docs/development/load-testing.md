# Load Testing Guide

This guide explains how to perform load testing on Project 2052 using Artillery.

## Overview

Load testing validates that the application can handle expected traffic levels and maintains performance under load. We use Artillery to simulate concurrent users and measure response times.

## Prerequisites

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start the application**:
   ```bash
   pnpm build
   pnpm start
   ```

   The app should be running on http://localhost:3000

## Test Configurations

### 1. Full Load Test (`artillery.yml`)

**Duration**: ~5 minutes
**Max Concurrent Users**: 100/second
**Target**: p95 < 2 seconds

**Test Phases**:
- **Warm-up**: 5 users/sec for 30 seconds
- **Ramp-up**: 5 → 20 users/sec over 60 seconds
- **Sustained**: 50 users/sec for 120 seconds
- **Peak**: 100 users/sec for 60 seconds
- **Cool-down**: 100 → 10 users/sec over 30 seconds

**Scenarios Tested**:
1. Dashboard Metrics (30% weight) - Cached endpoint
2. List Proposals (25% weight) - Database query
3. Get Proposal (20% weight) - Individual record fetch
4. Calculate Financials (15% weight) - Heavy computation
5. Health Check (10% weight) - Lightweight status check

**Run command**:
```bash
pnpm test:load
```

### 2. Quick Load Test (`artillery-quick.yml`)

**Duration**: 30 seconds
**Max Concurrent Users**: 10/second
**Target**: p95 < 3 seconds

**Use case**: CI/CD pipelines, quick validation

**Run command**:
```bash
pnpm test:load:quick
```

### 3. Load Test with Report

Generates an HTML report with charts and detailed metrics.

**Run command**:
```bash
pnpm test:load:report
```

This creates:
- `report.json` - Raw test data
- `report.json.html` - Visual report (open in browser)

## Performance Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **p50** | < 500ms | 50% of requests complete in under 500ms |
| **p95** | < 2s | 95% of requests complete in under 2 seconds |
| **p99** | < 5s | 99% of requests complete in under 5 seconds |
| **Error Rate** | < 1% | Less than 1% of requests fail |

## Understanding Results

### Successful Test Output
```
Summary report @ 23:45:12(+0000)
  Scenarios launched:  3000
  Scenarios completed: 3000
  Requests completed:  3000
  Response time (msec):
    min: 52
    max: 1847
    median: 345
    p95: 1245
    p99: 1789
  Scenario counts:
    Dashboard Metrics: 900 (30%)
    Calculate Financials: 450 (15%)
```

### Key Metrics to Monitor

1. **Response Times**:
   - Check p95 and p99 percentiles
   - Look for spikes during peak load
   - Compare warm-up vs peak performance

2. **Error Rate**:
   - Should be < 1% overall
   - Investigate any 500 errors immediately
   - 429 (rate limit) errors may indicate throttling

3. **Throughput**:
   - Requests/second sustained
   - Should scale linearly with arrival rate

4. **Latency by Endpoint**:
   - Dashboard Metrics: < 100ms (cached)
   - List Proposals: < 500ms (database)
   - Calculate Financials: < 1.5s (computation)
   - Health Check: < 50ms (status)

## Common Issues & Solutions

### Issue: High p95 latency (> 2s)

**Possible Causes**:
- Database query performance
- Insufficient connection pooling
- Cache misses
- Heavy computation without optimization

**Solutions**:
1. Check database indexes
2. Review Prisma query performance
3. Enable query logging: `prisma: { log: ['query'] }`
4. Increase database connection pool size

### Issue: High error rate (> 1%)

**Possible Causes**:
- Database connection exhaustion
- Memory leaks
- Unhandled errors in API routes

**Solutions**:
1. Check application logs
2. Monitor memory usage during test
3. Review error types (4xx vs 5xx)
4. Check database connection limits

### Issue: Degraded performance over time

**Possible Causes**:
- Memory leaks
- Cache bloat
- Connection leaks

**Solutions**:
1. Monitor memory throughout test phases
2. Check for resource cleanup
3. Review cache eviction policies

## Advanced Usage

### Custom Test Configuration

Create a custom Artillery config:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 25
  ensure:
    p95: 1500
    maxErrorRate: 0.5

scenarios:
  - name: "Custom Scenario"
    flow:
      - get:
          url: "/api/custom-endpoint"
```

Run with:
```bash
artillery run custom-config.yml
```

### Environment Variables

Override target URL:
```bash
artillery run --target https://staging.example.com artillery.yml
```

### Load Test in Production

⚠️ **WARNING**: Only run load tests in production with proper planning:

1. **Notify stakeholders** - Inform team and users
2. **Start small** - Begin with quick test
3. **Monitor closely** - Watch application and database metrics
4. **Have rollback plan** - Be ready to scale or revert
5. **Test off-hours** - Minimize user impact

```bash
# Production load test (use with caution!)
artillery run --target https://production.example.com artillery-quick.yml
```

## Integration with CI/CD

Add to GitHub Actions workflow:

```yaml
- name: Load Test
  run: |
    pnpm build
    pnpm start &
    sleep 10  # Wait for server to start
    pnpm test:load:quick
```

## Performance Benchmarks

Based on Phase 2 testing:

| Operation | Baseline | Target | Achieved |
|-----------|----------|--------|----------|
| 30-year calculation | ~500ms | < 1s | ✅ 500ms |
| Cached result | N/A | < 100ms | ✅ 10ms |
| Dashboard load | N/A | < 500ms | 🔄 TBD |
| API response (p95) | N/A | < 2s | 🔄 TBD |

## Troubleshooting

### Artillery not found
```bash
pnpm install  # Reinstall dependencies
```

### Port 3000 in use
```bash
lsof -ti:3000 | xargs kill  # Kill process using port 3000
pnpm start  # Restart server
```

### Tests timing out
1. Increase timeout in config: `http.timeout: 60`
2. Check server is running: `curl http://localhost:3000/api/health`
3. Review server logs for errors

## Best Practices

1. **Always warm up**: Include a warm-up phase to initialize caches
2. **Realistic scenarios**: Use production-like data and workflows
3. **Monitor everything**: Watch CPU, memory, database during tests
4. **Iterate**: Start small, gradually increase load
5. **Document results**: Track performance over time

## Next Steps

After load testing:
1. Review results against targets
2. Identify bottlenecks
3. Optimize slow endpoints
4. Re-test to validate improvements
5. Set up continuous performance monitoring

## Resources

- [Artillery Documentation](https://www.artillery.io/docs)
- [Performance Testing Best Practices](https://www.artillery.io/docs/guides/getting-started/core-concepts)
- Project metrics: See `TRACK_2_PERFORMANCE_OPTIMIZATION_COMPLETE.md`
