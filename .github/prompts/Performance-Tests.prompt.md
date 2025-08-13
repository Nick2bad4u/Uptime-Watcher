---
mode: "agent"
tools: ['All Tools']
description: "Create performance benchmarks and optimization tests"
---

Create performance tests and benchmarks for: ${input:feature}

Requirements:

- Use Vitest benchmark utilities
- Measure performance metrics and memory usage
- Create baseline benchmarks for comparison
- Test with various data sizes and conditions
- Include memory leak detection
- Test concurrent operations performance
- Monitor resource utilization
- Create performance regression tests

Performance Metrics:

- Execution time measurements
- Memory allocation and usage
- CPU utilization during operations
- Database query performance
- Network request latency
- UI rendering performance
- Large dataset handling
- Real-time update performance

Benchmark Categories:

- Database operations (CRUD, queries, migrations)
- Data processing and transformation
- UI component rendering
- Chart and graph generation
- File operations and I/O
- Network monitoring accuracy
- Memory management efficiency
- Startup and initialization time

Test Scenarios:

- Small datasets (1-100 items)
- Medium datasets (100-1000 items)
- Large datasets (1000+ items)
- Concurrent operations
- Memory-constrained environments
- Slow network conditions
- High CPU load situations
- Extended operation duration

Memory Testing:

- Memory leak detection
- Garbage collection efficiency
- Peak memory usage
- Memory growth over time
- Resource cleanup verification
- Cache efficiency
- Memory allocation patterns

Monitoring Tools:

- Performance.mark() and Performance.measure()
- Memory usage tracking
- CPU profiling integration
- Database query analysis
- Network performance monitoring
- UI performance metrics
- Electron process monitoring

Reporting:

- Performance comparison reports
- Regression detection alerts
- Memory usage visualizations
- Benchmark history tracking
- Performance bottleneck identification
- Optimization recommendations

Integration:

- CI/CD pipeline integration
- Automated performance regression detection
- Performance budget enforcement
- Historical trend analysis
- Alert thresholds for critical metrics
