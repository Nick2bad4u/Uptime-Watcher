/**
 * @fileoverview Benchmarks for database migration operations.
 * 
 * Tests performance of schema migrations, data migrations, rollbacks,
 * and version management across different database sizes and complexity scenarios.
 * 
 * @module benchmarks/database/migrationOperations
 */

import { bench, describe } from "vitest";

// Define comprehensive interfaces for type safety
interface MigrationDefinition {
  migrationId: string;
  version: string;
  name: string;
  type: 'schema' | 'data' | 'mixed';
  operations: MigrationOperation[];
  dependencies: string[];
  rollbackSupported: boolean;
  estimatedDuration: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface MigrationOperation {
  operationId: string;
  type: 'create-table' | 'alter-table' | 'drop-table' | 'create-index' | 'drop-index' | 
        'insert-data' | 'update-data' | 'delete-data' | 'custom-script';
  target: string;
  sql?: string;
  parameters?: Record<string, unknown>;
  estimatedRows?: number;
  dependencies?: string[];
}

interface MigrationExecution {
  executionId: string;
  migrationId: string;
  startTime: number;
  endTime: number;
  success: boolean;
  direction: 'up' | 'down';
  operationsCompleted: number;
  totalOperations: number;
  rowsAffected: number;
  rollbackRequired: boolean;
  error?: string;
  checkpointData?: Record<string, unknown>;
}

interface MigrationState {
  currentVersion: string;
  appliedMigrations: string[];
  pendingMigrations: string[];
  lastMigrationTime: number;
  migrationLockActive: boolean;
  backupCreated: boolean;
}

interface RollbackOperation {
  rollbackId: string;
  targetVersion: string;
  fromVersion: string;
  migrationsToRollback: string[];
  startTime: number;
  endTime: number;
  success: boolean;
  dataLoss: boolean;
  backupRestored: boolean;
  error?: string;
}

describe("Database Migration Operations Benchmarks", () => {
  const databaseSizes = [
    { name: 'small', tableCount: 10, totalRows: 10_000 },
    { name: 'medium', tableCount: 50, totalRows: 500_000 },
    { name: 'large', tableCount: 200, totalRows: 10_000_000 },
  ];

  // Schema migration performance
  bench("schema migration simulation", () => {
    const schemaMigrations: MigrationDefinition[] = [];
    const migrationExecutions: MigrationExecution[] = [];
    
    // Generate schema migration scenarios
    const schemaMigrationTypes = [
      {
        name: 'add-column',
        riskLevel: 'low' as const,
        operationTypes: ['alter-table'],
        estimatedDuration: 5000,
        rollbackSupported: true,
      },
      {
        name: 'create-table',
        riskLevel: 'low' as const,
        operationTypes: ['create-table', 'create-index'],
        estimatedDuration: 2000,
        rollbackSupported: true,
      },
      {
        name: 'drop-column',
        riskLevel: 'high' as const,
        operationTypes: ['alter-table'],
        estimatedDuration: 10_000,
        rollbackSupported: false,
      },
      {
        name: 'rename-table',
        riskLevel: 'medium' as const,
        operationTypes: ['alter-table'],
        estimatedDuration: 3000,
        rollbackSupported: true,
      },
      {
        name: 'add-foreign-key',
        riskLevel: 'medium' as const,
        operationTypes: ['alter-table'],
        estimatedDuration: 15_000,
        rollbackSupported: true,
      },
    ];
    
    let migrationCounter = 0;
    let versionCounter = 1;
    
    // Generate migrations for different scenarios
    for (let i = 0; i < 100; i++) {
      const scenario = schemaMigrationTypes[Math.floor(Math.random() * schemaMigrationTypes.length)];
      const dbSize = databaseSizes[Math.floor(Math.random() * databaseSizes.length)];
      
      const operations: MigrationOperation[] = scenario.operationTypes.map((opType, index) => ({
        operationId: `op-${migrationCounter}-${index}`,
        type: opType as MigrationOperation['type'],
        target: `table_${Math.floor(Math.random() * dbSize.tableCount)}`,
        sql: `-- ${opType} operation on ${dbSize.name} database`,
        estimatedRows: Math.floor(dbSize.totalRows / dbSize.tableCount),
      }));
      
      const migration: MigrationDefinition = {
        migrationId: `migration-${migrationCounter++}`,
        version: `1.0.${versionCounter++}`,
        name: `${scenario.name}-${dbSize.name}-db`,
        type: 'schema',
        operations,
        dependencies: i > 0 ? [`migration-${migrationCounter - 2}`] : [],
        rollbackSupported: scenario.rollbackSupported,
        estimatedDuration: scenario.estimatedDuration,
        riskLevel: scenario.riskLevel,
      };
      
      schemaMigrations.push(migration);
    }
    
    // Execute schema migrations
    let currentTime = Date.now();
    
    for (const migration of schemaMigrations) {
      const startTime = currentTime;
      
      // Calculate actual execution time based on estimated duration and database size
      const dbSize = databaseSizes.find(db => migration.name.includes(db.name)) || databaseSizes[0];
      
      let actualDuration = migration.estimatedDuration;
      
      // Apply size multiplier
      const sizeMultiplier = {
        small: 1,
        medium: 2.5,
        large: 8,
      }[dbSize.name] ?? 1;
      
      actualDuration *= sizeMultiplier;
      
      // Apply risk level variance
      const riskVariance = {
        low: 0.2,
        medium: 0.4,
        high: 0.8,
      }[migration.riskLevel];
      
      const variance = (Math.random() - 0.5) * riskVariance;
      actualDuration *= (1 + variance);
      
      // Simulate operation-specific timing
      let operationsCompleted = 0;
      let totalRowsAffected = 0;
      let success = true;
      let error: string | undefined;
      
      for (const operation of migration.operations) {
        const opStartTime = Date.now();
        let opDuration = actualDuration / migration.operations.length;
        
        // Operation-specific adjustments
        switch (operation.type) {
          case 'create-table': {
            opDuration *= 0.5; // Tables create quickly
            break;
          }
          case 'alter-table': {
            opDuration *= 1.5; // Alterations take longer
            break;
          }
          case 'create-index': {
            opDuration *= 2; // Indexes take time to build
            break;
          }
          case 'drop-table': {
            opDuration *= 0.3; // Drops are fast
            break;
          }
        }
        
        // Simulate failure chance based on risk level
        const failureRate = {
          low: 0.01,
          medium: 0.05,
          high: 0.15,
        }[migration.riskLevel];
        
        if (Math.random() < failureRate) {
          success = false;
          error = `${operation.type} operation failed on ${operation.target}`;
          break;
        }
        
        operationsCompleted++;
        totalRowsAffected += operation.estimatedRows || 0;
        
        currentTime += opDuration;
      }
      
      const endTime = currentTime;
      
      const execution: MigrationExecution = {
        executionId: `exec-${migration.migrationId}`,
        migrationId: migration.migrationId,
        startTime,
        endTime,
        success,
        direction: 'up',
        operationsCompleted,
        totalOperations: migration.operations.length,
        rowsAffected: totalRowsAffected,
        rollbackRequired: !success && migration.rollbackSupported,
        error,
        checkpointData: success ? undefined : {
          lastSuccessfulOperation: operationsCompleted - 1,
          partialState: true,
        },
      };
      
      migrationExecutions.push(execution);
      
      // Add time gap between migrations
      currentTime += Math.random() * 5000 + 1000; // 1-6 seconds
    }
    
    // Calculate schema migration metrics
    const successfulMigrations = migrationExecutions.filter(exec => exec.success);
    const failedMigrations = migrationExecutions.filter(exec => !exec.success);
    
    const averageExecutionTime = migrationExecutions.reduce(
      (sum, exec) => sum + (exec.endTime - exec.startTime), 0
    ) / migrationExecutions.length;
    
    const totalRowsAffected = migrationExecutions.reduce(
      (sum, exec) => sum + exec.rowsAffected, 0
    );
    
    const riskLevelAnalysis = ['low', 'medium', 'high'].map(risk => {
      const riskMigrations = schemaMigrations.filter(m => m.riskLevel === risk);
      const riskExecutions = migrationExecutions.filter(exec => 
        schemaMigrations.find(m => m.migrationId === exec.migrationId)?.riskLevel === risk
      );
      const riskSuccessful = riskExecutions.filter(exec => exec.success);
      
      return {
        riskLevel: risk,
        totalMigrations: riskMigrations.length,
        successful: riskSuccessful.length,
        successRate: riskExecutions.length > 0 ? riskSuccessful.length / riskExecutions.length : 0,
        averageTime: riskExecutions.length > 0 ?
          riskExecutions.reduce((sum, exec) => sum + (exec.endTime - exec.startTime), 0) / riskExecutions.length : 0,
      };
    });
  });

  // Data migration performance
  bench("data migration simulation", () => {
    const dataMigrations: MigrationDefinition[] = [];
    const dataExecutions: MigrationExecution[] = [];
    
    const dataMigrationScenarios = [
      {
        name: 'bulk-insert',
        operations: ['insert-data'],
        batchSize: 1000,
        riskLevel: 'low' as const,
      },
      {
        name: 'data-transformation',
        operations: ['update-data'],
        batchSize: 500,
        riskLevel: 'medium' as const,
      },
      {
        name: 'data-cleanup',
        operations: ['delete-data'],
        batchSize: 200,
        riskLevel: 'high' as const,
      },
      {
        name: 'data-migration',
        operations: ['insert-data', 'update-data', 'delete-data'],
        batchSize: 300,
        riskLevel: 'high' as const,
      },
    ];
    
    let migrationCounter = 100; // Continue from schema migrations
    let versionCounter = 100;
    
    for (let i = 0; i < 80; i++) {
      const scenario = dataMigrationScenarios[Math.floor(Math.random() * dataMigrationScenarios.length)];
      const dbSize = databaseSizes[Math.floor(Math.random() * databaseSizes.length)];
      
      const recordsToProcess = Math.floor(dbSize.totalRows * (0.1 + Math.random() * 0.4)); // 10-50% of data
      const batchCount = Math.ceil(recordsToProcess / scenario.batchSize);
      
      const operations: MigrationOperation[] = scenario.operations.map((opType, index) => ({
        operationId: `data-op-${migrationCounter}-${index}`,
        type: opType as MigrationOperation['type'],
        target: `table_${Math.floor(Math.random() * dbSize.tableCount)}`,
        sql: `-- ${opType} operation processing ${recordsToProcess} records`,
        estimatedRows: Math.floor(recordsToProcess / scenario.operations.length),
        parameters: {
          batchSize: scenario.batchSize,
          totalBatches: batchCount,
        },
      }));
      
      const migration: MigrationDefinition = {
        migrationId: `data-migration-${migrationCounter++}`,
        version: `2.0.${versionCounter++}`,
        name: `${scenario.name}-${dbSize.name}-${recordsToProcess}-records`,
        type: 'data',
        operations,
        dependencies: [],
        rollbackSupported: scenario.riskLevel !== 'high',
        estimatedDuration: batchCount * 100, // 100ms per batch
        riskLevel: scenario.riskLevel,
      };
      
      dataMigrations.push(migration);
    }
    
    // Execute data migrations
    let currentTime = Date.now();
    
    for (const migration of dataMigrations) {
      const startTime = currentTime;
      
      let totalProcessedRows = 0;
      let operationsCompleted = 0;
      let success = true;
      let error: string | undefined;
      
      for (const operation of migration.operations) {
        const batchSize = operation.parameters?.batchSize as number || 1000;
        const estimatedRows = operation.estimatedRows || 0;
        const batchCount = Math.ceil(estimatedRows / batchSize);
        
        // Process in batches
        for (let batch = 0; batch < batchCount; batch++) {
          const batchStartTime = currentTime;
          
          // Calculate batch processing time
          let baseBatchTime = 50; // 50ms base per batch
          
          // Operation type impact
          switch (operation.type) {
            case 'insert-data': {
              baseBatchTime *= 1;
              break;
            }
            case 'update-data': {
              baseBatchTime *= 1.5; // Updates take longer
              break;
            }
            case 'delete-data': {
              baseBatchTime *= 0.8; // Deletes are faster
              break;
            }
          }
          
          // Database size impact
          const dbSize = databaseSizes.find(db => migration.name.includes(db.name));
          if (dbSize) {
            const sizeMultiplier = {
              small: 1,
              medium: 1.3,
              large: 2,
            }[dbSize.name] ?? 1;
            baseBatchTime *= sizeMultiplier;
          }
          
          // Add variance
          const variance = (Math.random() - 0.5) * 0.4;
          const actualBatchTime = baseBatchTime * (1 + variance);
          
          // Simulate batch failure
          const batchFailureRate = {
            low: 0.001,
            medium: 0.005,
            high: 0.02,
          }[migration.riskLevel];
          
          if (Math.random() < batchFailureRate) {
            success = false;
            error = `Batch ${batch + 1} failed during ${operation.type}`;
            break;
          }
          
          const rowsInBatch = Math.min(batchSize, estimatedRows - (batch * batchSize));
          totalProcessedRows += rowsInBatch;
          
          currentTime += actualBatchTime;
          
          // Simulate memory pressure or lock contention
          if (batch > 0 && batch % 10 === 0) {
            currentTime += Math.random() * 50; // 0-50ms pause every 10 batches
          }
        }
        
        if (!success) break;
        
        operationsCompleted++;
      }
      
      const endTime = currentTime;
      
      const execution: MigrationExecution = {
        executionId: `data-exec-${migration.migrationId}`,
        migrationId: migration.migrationId,
        startTime,
        endTime,
        success,
        direction: 'up',
        operationsCompleted,
        totalOperations: migration.operations.length,
        rowsAffected: totalProcessedRows,
        rollbackRequired: !success && migration.rollbackSupported,
        error,
        checkpointData: success ? undefined : {
          processedRows: totalProcessedRows,
          lastCompletedOperation: operationsCompleted - 1,
        },
      };
      
      dataExecutions.push(execution);
      
      // Add cooldown time between data migrations
      currentTime += Math.random() * 10_000 + 5000; // 5-15 seconds
    }
    
    // Calculate data migration metrics
    const successfulDataMigrations = dataExecutions.filter(exec => exec.success);
    const totalDataProcessed = dataExecutions.reduce((sum, exec) => sum + exec.rowsAffected, 0);
    
    const averageRowsPerSecond = dataExecutions.length > 0 ?
      totalDataProcessed / (dataExecutions.reduce((sum, exec) => sum + (exec.endTime - exec.startTime), 0) / 1000) : 0;
    
    const batchingAnalysis = dataMigrationScenarios.map(scenario => {
      const scenarioMigrations = dataMigrations.filter(m => m.name.includes(scenario.name));
      const scenarioExecutions = dataExecutions.filter(exec =>
        scenarioMigrations.some(m => m.migrationId === exec.migrationId)
      );
      
      const avgThroughput = scenarioExecutions.length > 0 ?
        scenarioExecutions.reduce((sum, exec) => {
          const duration = (exec.endTime - exec.startTime) / 1000;
          return sum + (exec.rowsAffected / duration);
        }, 0) / scenarioExecutions.length : 0;
      
      return {
        scenario: scenario.name,
        batchSize: scenario.batchSize,
        executions: scenarioExecutions.length,
        averageThroughput: avgThroughput,
        successRate: scenarioExecutions.length > 0 ?
          scenarioExecutions.filter(exec => exec.success).length / scenarioExecutions.length : 0,
      };
    });
  });

  // Migration rollback simulation
  bench("migration rollback simulation", () => {
    const rollbackOperations: RollbackOperation[] = [];
    const migrationHistory: MigrationState[] = [];
    
    // Simulate applied migrations history
    const appliedMigrations = Array.from({ length: 50 }, (_, i) => `migration-${i + 1}`);
    
    const currentState: MigrationState = {
      currentVersion: '2.0.50',
      appliedMigrations: [...appliedMigrations],
      pendingMigrations: [],
      lastMigrationTime: Date.now() - 86_400_000, // 1 day ago
      migrationLockActive: false,
      backupCreated: true,
    };
    
    migrationHistory.push({ ...currentState });
    
    // Simulate rollback scenarios
    const rollbackScenarios = [
      {
        name: 'single-migration-rollback',
        rollbackCount: 1,
        reason: 'bug-fix',
        urgency: 'low',
      },
      {
        name: 'minor-version-rollback',
        rollbackCount: 5,
        reason: 'compatibility-issue',
        urgency: 'medium',
      },
      {
        name: 'major-version-rollback',
        rollbackCount: 15,
        reason: 'critical-failure',
        urgency: 'high',
      },
      {
        name: 'emergency-rollback',
        rollbackCount: 25,
        reason: 'data-corruption',
        urgency: 'critical',
      },
    ];
    
    let currentTime = Date.now();
    
    for (let i = 0; i < 30; i++) {
      const scenario = rollbackScenarios[Math.floor(Math.random() * rollbackScenarios.length)];
      
      if (currentState.appliedMigrations.length < scenario.rollbackCount) {
        continue; // Skip if not enough migrations to rollback
      }
      
      const startTime = currentTime;
      
      // Determine migrations to rollback
      const migrationsToRollback = currentState.appliedMigrations
        .slice(-scenario.rollbackCount)
        .reverse(); // Rollback in reverse order
      
      const targetVersion = currentState.appliedMigrations[
        currentState.appliedMigrations.length - scenario.rollbackCount
      ] || '1.0.0';
      
      const fromVersion = currentState.currentVersion;
      
      // Calculate rollback complexity and time
      let rollbackDuration = 0;
      let operationsCompleted = 0;
      let success = true;
      let dataLoss = false;
      let backupRestored = false;
      let error: string | undefined;
      
      // Lock migrations during rollback
      currentState.migrationLockActive = true;
      
      for (const migrationToRollback of migrationsToRollback) {
        
        // Simulate rollback operation complexity
        let migrationRollbackTime = 2000; // 2 seconds base
        
        // Urgency affects rollback speed
        const urgencyMultiplier = {
          low: 1,
          medium: 0.8,
          high: 0.6,
          critical: 0.4,
        }[scenario.urgency] ?? 1;
        
        migrationRollbackTime *= urgencyMultiplier;
        
        // Add complexity based on migration type (simulated)
        const migrationComplexity = Math.random();
        if (migrationComplexity > 0.8) {
          migrationRollbackTime *= 3; // Complex migration
          dataLoss = Math.random() > 0.7; // 30% chance of data loss
        } else if (migrationComplexity > 0.6) {
          migrationRollbackTime *= 2; // Medium complexity
        }
        
        // Simulate rollback failure
        const rollbackFailureRate = {
          low: 0.02,
          medium: 0.05,
          high: 0.15,
          critical: 0.25,
        }[scenario.urgency] ?? 0.05;
        
        if (Math.random() < rollbackFailureRate) {
          success = false;
          error = `Failed to rollback migration ${migrationToRollback}`;
          
          // Emergency backup restore for critical failures
          if (scenario.urgency === 'critical' && currentState.backupCreated) {
            backupRestored = true;
            rollbackDuration += 30_000; // 30 seconds for backup restore
            success = true; // Backup restore saves the rollback
            error = undefined;
            dataLoss = true; // Backup restore means some data loss
          }
          break;
        }
        
        rollbackDuration += migrationRollbackTime;
        operationsCompleted++;
        
        // Remove migration from applied list
        const migrationIndex = currentState.appliedMigrations.indexOf(migrationToRollback);
        if (migrationIndex !== -1) {
          currentState.appliedMigrations.splice(migrationIndex, 1);
          currentState.pendingMigrations.unshift(migrationToRollback);
        }
      }
      
      const endTime = currentTime + rollbackDuration;
      
      // Update state if successful
      if (success) {
        currentState.currentVersion = targetVersion;
        currentState.lastMigrationTime = endTime;
      }
      
      currentState.migrationLockActive = false;
      
      const rollbackOperation: RollbackOperation = {
        rollbackId: `rollback-${i}`,
        targetVersion,
        fromVersion,
        migrationsToRollback,
        startTime,
        endTime,
        success,
        dataLoss,
        backupRestored,
        error,
      };
      
      rollbackOperations.push(rollbackOperation);
      
      // Save state snapshot
      migrationHistory.push({ ...currentState });
      
      currentTime = endTime + Math.random() * 30_000 + 10_000; // 10-40 seconds between rollbacks
    }
    
    // Calculate rollback metrics
    const successfulRollbacks = rollbackOperations.filter(op => op.success);
    const rollbacksWithDataLoss = rollbackOperations.filter(op => op.dataLoss);
    const backupRestores = rollbackOperations.filter(op => op.backupRestored);
    
    const averageRollbackTime = rollbackOperations.reduce(
      (sum, op) => sum + (op.endTime - op.startTime), 0
    ) / rollbackOperations.length;
    
    const rollbacksByScenario = rollbackScenarios.map(scenario => {
      const scenarioRollbacks = rollbackOperations.filter(op => 
        op.migrationsToRollback.length === scenario.rollbackCount
      );
      
      return {
        scenario: scenario.name,
        rollbackCount: scenario.rollbackCount,
        operations: scenarioRollbacks.length,
        successRate: scenarioRollbacks.length > 0 ?
          scenarioRollbacks.filter(op => op.success).length / scenarioRollbacks.length : 0,
        averageTime: scenarioRollbacks.length > 0 ?
          scenarioRollbacks.reduce((sum, op) => sum + (op.endTime - op.startTime), 0) / scenarioRollbacks.length : 0,
        dataLossRate: scenarioRollbacks.length > 0 ?
          scenarioRollbacks.filter(op => op.dataLoss).length / scenarioRollbacks.length : 0,
      };
    });
    
    const rollbackMetrics = {
      totalRollbacks: rollbackOperations.length,
      successfulRollbacks: successfulRollbacks.length,
      rollbacksWithDataLoss: rollbacksWithDataLoss.length,
      backupRestores: backupRestores.length,
      averageRollbackTime,
      rollbacksByScenario,
      successRate: rollbackOperations.length > 0 ? successfulRollbacks.length / rollbackOperations.length : 0,
      dataLossRate: rollbackOperations.length > 0 ? rollbacksWithDataLoss.length / rollbackOperations.length : 0,
    };
  });

  // Migration dependency and ordering
  bench("migration dependency simulation", () => {
    interface DependencyChain {
      chainId: string;
      migrations: MigrationDefinition[];
      executionOrder: string[];
      parallelGroups: string[][];
      totalExecutionTime: number;
      criticalPath: string[];
      dependencyViolations: number;
    }
    
    const dependencyChains: DependencyChain[] = [];
    
    // Generate complex dependency scenarios
    for (let scenario = 0; scenario < 20; scenario++) {
      const migrationCount = Math.floor(Math.random() * 20) + 10; // 10-30 migrations
      const migrations: MigrationDefinition[] = [];
      
      // Create base migrations
      for (let i = 0; i < migrationCount; i++) {
        const migration: MigrationDefinition = {
          migrationId: `dep-migration-${scenario}-${i}`,
          version: `${scenario}.0.${i}`,
          name: `migration-${i}`,
          type: Math.random() > 0.5 ? 'schema' : 'data',
          operations: [{
            operationId: `op-${scenario}-${i}`,
            type: 'alter-table',
            target: `table_${Math.floor(i / 3)}`, // Group migrations by table
          }],
          dependencies: [],
          rollbackSupported: Math.random() > 0.2,
          estimatedDuration: Math.random() * 10_000 + 2000, // 2-12 seconds
          riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        };
        
        migrations.push(migration);
      }
      
      // Add dependencies
      for (let i = 1; i < migrations.length; i++) {
        const migration = migrations[i];
        
        // Random dependency probability
        if (Math.random() > 0.4) { // 60% chance of having dependencies
          const dependencyCount = Math.floor(Math.random() * Math.min(3, i)) + 1;
          
          for (let d = 0; d < dependencyCount; d++) {
            const depIndex = Math.floor(Math.random() * i);
            const depMigration = migrations[depIndex];
            
            if (!migration.dependencies.includes(depMigration.migrationId)) {
              migration.dependencies.push(depMigration.migrationId);
            }
          }
        }
      }
      
      // Calculate execution order using topological sort
      const executionOrder: string[] = [];
      const parallelGroups: string[][] = [];
      const inDegree: Record<string, number> = {};
      const adjList: Record<string, string[]> = {};
      
      // Initialize
      for (const migration of migrations) {
        inDegree[migration.migrationId] = 0;
        adjList[migration.migrationId] = [];
      }
      
      // Build dependency graph
      for (const migration of migrations) {
        for (const depId of migration.dependencies) {
          adjList[depId].push(migration.migrationId);
          inDegree[migration.migrationId]++;
        }
      }
      
      // Topological sort with parallelization
      const queue: string[] = [];
      const executionGroups: string[][] = [];
      
      // Find initial nodes with no dependencies
      for (const migrationId of Object.keys(inDegree)) {
        if (inDegree[migrationId] === 0) {
          queue.push(migrationId);
        }
      }
      
      while (queue.length > 0) {
        const currentGroup: string[] = [...queue];
        executionGroups.push(currentGroup);
        parallelGroups.push(currentGroup);
        queue.length = 0;
        
        for (const migrationId of currentGroup) {
          executionOrder.push(migrationId);
          
          for (const neighbor of adjList[migrationId]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
              queue.push(neighbor);
            }
          }
        }
      }
      
      // Check for circular dependencies
      const dependencyViolations = migrations.length - executionOrder.length;
      
      // Calculate execution time considering parallelization
      let totalExecutionTime = 0;
      for (const group of executionGroups) {
        const groupExecutionTime = Math.max(
          ...group.map(migrationId => {
            const migration = migrations.find(m => m.migrationId === migrationId);
            return migration?.estimatedDuration || 0;
          })
        );
        totalExecutionTime += groupExecutionTime;
      }
      
      // Calculate critical path
      const criticalPath: string[] = [];
      if (executionGroups.length > 0) {
        for (const group of executionGroups) {
          const longestMigration = group.reduce((longest, migrationId) => {
            const migration = migrations.find(m => m.migrationId === migrationId);
            const longestMig = migrations.find(m => m.migrationId === longest);
            
            return (migration?.estimatedDuration || 0) > (longestMig?.estimatedDuration || 0) ? 
              migrationId : longest;
          }, group[0]);
          
          criticalPath.push(longestMigration);
        }
      }
      
      const dependencyChain: DependencyChain = {
        chainId: `chain-${scenario}`,
        migrations,
        executionOrder,
        parallelGroups,
        totalExecutionTime,
        criticalPath,
        dependencyViolations,
      };
      
      dependencyChains.push(dependencyChain);
    }
    
    // Calculate dependency analysis metrics
    const averageParallelization = dependencyChains.reduce((sum, chain) => {
      const totalMigrations = chain.migrations.length;
      const parallelizableGroups = chain.parallelGroups.length;
      return sum + (parallelizableGroups / totalMigrations);
    }, 0) / dependencyChains.length;
    
    const averageExecutionTimeReduction = dependencyChains.reduce((sum, chain) => {
      const sequentialTime = chain.migrations.reduce((total, m) => total + m.estimatedDuration, 0);
      const parallelTime = chain.totalExecutionTime;
      return sum + ((sequentialTime - parallelTime) / sequentialTime);
    }, 0) / dependencyChains.length;
    
    const dependencyComplexity = dependencyChains.map(chain => ({
      chainId: chain.chainId,
      migrationCount: chain.migrations.length,
      dependencyCount: chain.migrations.reduce((sum, m) => sum + m.dependencies.length, 0),
      parallelGroups: chain.parallelGroups.length,
      executionTimeReduction: (() => {
        const sequential = chain.migrations.reduce((sum, m) => sum + m.estimatedDuration, 0);
        return ((sequential - chain.totalExecutionTime) / sequential) * 100;
      })(),
      dependencyViolations: chain.dependencyViolations,
      criticalPathLength: chain.criticalPath.length,
    }));
    
    const complexityStats = {
      averageParallelization,
      averageExecutionTimeReduction,
      chainsWithViolations: dependencyChains.filter(c => c.dependencyViolations > 0).length,
      maxParallelization: Math.max(...dependencyChains.map(c => c.parallelGroups.length)),
      dependencyComplexity,
    };
  });
});
