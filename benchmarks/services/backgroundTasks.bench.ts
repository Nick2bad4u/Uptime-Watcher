/**
 * Background Task Service Performance Benchmarks
 *
 * @file Performance benchmarks for background task processing, job queues, and scheduling.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Services-BackgroundTasks
 * @tags ["performance", "services", "background-tasks", "jobs", "scheduling"]
 */

import { bench, describe } from "vitest";

interface Task {
    id: string;
    type: string;
    payload: any;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying' | 'cancelled';
    createdAt: Date;
    scheduledAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    attempts: number;
    maxAttempts: number;
    retryDelay: number;
    timeout: number;
    tags: string[];
    metadata: Record<string, any>;
}

interface TaskResult {
    taskId: string;
    success: boolean;
    result?: any;
    error?: string;
    executionTime: number;
    memoryUsage?: number;
}

interface Worker {
    id: string;
    name: string;
    isActive: boolean;
    currentTask?: string;
    processedTasks: number;
    failedTasks: number;
    lastActivity: Date;
    capabilities: string[];
    maxConcurrency: number;
    currentLoad: number;
}

interface QueueStats {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    totalProcessed: number;
    averageExecutionTime: number;
    queueThroughput: number;
    workerUtilization: number;
}

interface ScheduledJob {
    id: string;
    name: string;
    cronExpression: string;
    taskType: string;
    payload: any;
    isActive: boolean;
    lastRun?: Date;
    nextRun: Date;
    runCount: number;
    failureCount: number;
    metadata: Record<string, any>;
}

interface TaskProcessor {
    type: string;
    handler: (payload: any, context: TaskExecutionContext) => Promise<any>;
    timeout?: number;
    retryPolicy?: RetryPolicy;
}

interface TaskExecutionContext {
    taskId: string;
    attempt: number;
    worker: Worker;
    signal: AbortSignal;
    progress: (percentage: number, message?: string) => void;
}

interface RetryPolicy {
    maxAttempts: number;
    delay: number;
    backoffMultiplier: number;
    maxDelay: number;
}

class MockTaskQueue {
    private tasks = new Map<string, Task>();
    private results = new Map<string, TaskResult>();
    private nextId = 1;

    async enqueue(taskType: string, payload: any, options?: {
        priority?: Task['priority'];
        scheduledAt?: Date;
        timeout?: number;
        maxAttempts?: number;
        tags?: string[];
        metadata?: Record<string, any>;
    }): Promise<string> {
        const opts = {
            priority: 'normal' as const,
            scheduledAt: new Date(),
            timeout: 30_000,
            maxAttempts: 3,
            tags: [],
            metadata: {},
            ...options
        };

        const taskId = `task-${this.nextId++}`;
        const now = new Date();

        const task: Task = {
            id: taskId,
            type: taskType,
            payload,
            priority: opts.priority,
            status: 'pending',
            createdAt: now,
            scheduledAt: opts.scheduledAt,
            attempts: 0,
            maxAttempts: opts.maxAttempts,
            retryDelay: 1000,
            timeout: opts.timeout,
            tags: opts.tags,
            metadata: opts.metadata
        };

        this.tasks.set(taskId, task);
        return taskId;
    }

    async dequeue(workerCapabilities?: string[]): Promise<Task | null> {
        const now = new Date();
        
        // Find eligible tasks
        let eligibleTasks = Array.from(this.tasks.values()).filter(task => 
            task.status === 'pending' && 
            task.scheduledAt <= now
        );

        // Filter by worker capabilities
        if (workerCapabilities) {
            eligibleTasks = eligibleTasks.filter(task => 
                workerCapabilities.includes(task.type)
            );
        }

        if (eligibleTasks.length === 0) {
            return null;
        }

        // Sort by priority and creation time
        eligibleTasks.sort((a, b) => {
            const priorityOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
            const aPriority = priorityOrder[a.priority];
            const bPriority = priorityOrder[b.priority];
            
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }
            
            return a.createdAt.getTime() - b.createdAt.getTime();
        });

        const task = eligibleTasks[0];
        task.status = 'running';
        task.startedAt = now;
        task.attempts++;

        this.tasks.set(task.id, task);
        return { ...task };
    }

    async complete(taskId: string, result: any): Promise<void> {
        const task = this.tasks.get(taskId);
        if (!task) return;

        task.status = 'completed';
        task.completedAt = new Date();
        
        const executionTime = task.completedAt.getTime() - (task.startedAt?.getTime() || 0);
        
        const taskResult: TaskResult = {
            taskId,
            success: true,
            result,
            executionTime
        };

        this.results.set(taskId, taskResult);
        this.tasks.set(taskId, task);
    }

    async fail(taskId: string, error: string): Promise<void> {
        const task = this.tasks.get(taskId);
        if (!task) return;

        const now = new Date();
        const executionTime = now.getTime() - (task.startedAt?.getTime() || 0);

        const taskResult: TaskResult = {
            taskId,
            success: false,
            error,
            executionTime
        };

        this.results.set(taskId, taskResult);

        if (task.attempts >= task.maxAttempts) {
            task.status = 'failed';
            task.failedAt = now;
        } else {
            task.status = 'retrying';
            // Exponential backoff
            const delay = Math.min(
                task.retryDelay * 2**(task.attempts - 1),
                30_000 // Max 30 seconds
            );
            task.scheduledAt = new Date(now.getTime() + delay);
        }

        this.tasks.set(taskId, task);
    }

    async cancel(taskId: string): Promise<boolean> {
        const task = this.tasks.get(taskId);
        if (!task || task.status === 'running') {
            return false;
        }

        task.status = 'cancelled';
        this.tasks.set(taskId, task);
        return true;
    }

    async getTask(taskId: string): Promise<Task | null> {
        const task = this.tasks.get(taskId);
        return task ? { ...task } : null;
    }

    async getResult(taskId: string): Promise<TaskResult | null> {
        const result = this.results.get(taskId);
        return result ? { ...result } : null;
    }

    async getStats(): Promise<QueueStats> {
        const tasks = Array.from(this.tasks.values());
        const results = Array.from(this.results.values());

        const pending = tasks.filter(t => t.status === 'pending' || t.status === 'retrying').length;
        const running = tasks.filter(t => t.status === 'running').length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const failed = tasks.filter(t => t.status === 'failed').length;

        const successfulResults = results.filter(r => r.success);
        const averageExecutionTime = successfulResults.length > 0
            ? successfulResults.reduce((sum, r) => sum + r.executionTime, 0) / successfulResults.length
            : 0;

        return {
            pending,
            running,
            completed,
            failed,
            totalProcessed: completed + failed,
            averageExecutionTime,
            queueThroughput: 0, // Would be calculated over time
            workerUtilization: 0 // Would be calculated based on workers
        };
    }

    async cleanup(olderThan: Date): Promise<number> {
        let cleaned = 0;
        for (const [taskId, task] of this.tasks) {
            if ((task.status === 'completed' || task.status === 'failed') &&
                task.createdAt < olderThan) {
                this.tasks.delete(taskId);
                this.results.delete(taskId);
                cleaned++;
            }
        }
        return cleaned;
    }

    clear(): void {
        this.tasks.clear();
        this.results.clear();
        this.nextId = 1;
    }

    size(): number {
        return this.tasks.size;
    }
}

class MockWorkerPool {
    private workers = new Map<string, Worker>();
    private activeWorkers = new Set<string>();
    private nextId = 1;

    createWorker(name: string, capabilities: string[], maxConcurrency: number = 1): Worker {
        const workerId = `worker-${this.nextId++}`;
        const worker: Worker = {
            id: workerId,
            name,
            isActive: false,
            processedTasks: 0,
            failedTasks: 0,
            lastActivity: new Date(),
            capabilities,
            maxConcurrency,
            currentLoad: 0
        };

        this.workers.set(workerId, worker);
        return { ...worker };
    }

    async startWorker(workerId: string): Promise<boolean> {
        const worker = this.workers.get(workerId);
        if (!worker) return false;

        worker.isActive = true;
        worker.lastActivity = new Date();
        this.activeWorkers.add(workerId);
        this.workers.set(workerId, worker);
        return true;
    }

    async stopWorker(workerId: string): Promise<boolean> {
        const worker = this.workers.get(workerId);
        if (!worker) return false;

        worker.isActive = false;
        worker.currentTask = undefined;
        worker.currentLoad = 0;
        this.activeWorkers.delete(workerId);
        this.workers.set(workerId, worker);
        return true;
    }

    async assignTask(workerId: string, taskId: string): Promise<boolean> {
        const worker = this.workers.get(workerId);
        if (!worker || !worker.isActive || worker.currentLoad >= worker.maxConcurrency) {
            return false;
        }

        worker.currentTask = taskId;
        worker.currentLoad++;
        worker.lastActivity = new Date();
        this.workers.set(workerId, worker);
        return true;
    }

    async completeTask(workerId: string, success: boolean): Promise<void> {
        const worker = this.workers.get(workerId);
        if (!worker) return;

        worker.currentTask = undefined;
        worker.currentLoad = Math.max(0, worker.currentLoad - 1);
        worker.lastActivity = new Date();
        
        if (success) {
            worker.processedTasks++;
        } else {
            worker.failedTasks++;
        }

        this.workers.set(workerId, worker);
    }

    getAvailableWorkers(taskType?: string): Worker[] {
        return Array.from(this.workers.values()).filter(worker => 
            worker.isActive && 
            worker.currentLoad < worker.maxConcurrency &&
            (!taskType || worker.capabilities.includes(taskType))
        );
    }

    getAllWorkers(): Worker[] {
        return Array.from(this.workers.values()).map(worker => ({ ...worker }));
    }

    getWorkerStats(): any {
        const workers = Array.from(this.workers.values());
        const activeWorkers = workers.filter(w => w.isActive);
        
        return {
            totalWorkers: workers.length,
            activeWorkers: activeWorkers.length,
            totalProcessed: workers.reduce((sum, w) => sum + w.processedTasks, 0),
            totalFailed: workers.reduce((sum, w) => sum + w.failedTasks, 0),
            averageLoad: activeWorkers.length > 0 
                ? activeWorkers.reduce((sum, w) => sum + w.currentLoad, 0) / activeWorkers.length 
                : 0
        };
    }

    clear(): void {
        this.workers.clear();
        this.activeWorkers.clear();
        this.nextId = 1;
    }
}

class MockScheduler {
    private jobs = new Map<string, ScheduledJob>();
    private nextId = 1;

    createJob(name: string, cronExpression: string, taskType: string, payload: any, metadata?: Record<string, any>): ScheduledJob {
        const jobId = `job-${this.nextId++}`;
        const now = new Date();
        
        const job: ScheduledJob = {
            id: jobId,
            name,
            cronExpression,
            taskType,
            payload,
            isActive: true,
            nextRun: this.calculateNextRun(cronExpression, now),
            runCount: 0,
            failureCount: 0,
            metadata: metadata || {}
        };

        this.jobs.set(jobId, job);
        return { ...job };
    }

    async getJobsDue(): Promise<ScheduledJob[]> {
        const now = new Date();
        return Array.from(this.jobs.values())
            .filter(job => job.isActive && job.nextRun <= now)
            .map(job => ({ ...job }));
    }

    async markJobExecuted(jobId: string, success: boolean): Promise<void> {
        const job = this.jobs.get(jobId);
        if (!job) return;

        job.lastRun = new Date();
        job.runCount++;
        
        if (!success) {
            job.failureCount++;
        }

        job.nextRun = this.calculateNextRun(job.cronExpression, job.lastRun);
        this.jobs.set(jobId, job);
    }

    private calculateNextRun(cronExpression: string, from: Date): Date {
        // Simple implementation - just add intervals based on expression
        const now = from.getTime();
        
        if (cronExpression.includes('* * * * *')) { // Every minute
            return new Date(now + 60 * 1000);
        } else if (cronExpression.includes('0 * * * *')) { // Every hour
            return new Date(now + 60 * 60 * 1000);
        } else if (cronExpression.includes('0 0 * * *')) { // Daily
            return new Date(now + 24 * 60 * 60 * 1000);
        } 
            return new Date(now + 5 * 60 * 1000); // Default: 5 minutes
        
    }

    enableJob(jobId: string): boolean {
        const job = this.jobs.get(jobId);
        if (!job) return false;
        
        job.isActive = true;
        this.jobs.set(jobId, job);
        return true;
    }

    disableJob(jobId: string): boolean {
        const job = this.jobs.get(jobId);
        if (!job) return false;
        
        job.isActive = false;
        this.jobs.set(jobId, job);
        return true;
    }

    getAllJobs(): ScheduledJob[] {
        return Array.from(this.jobs.values()).map(job => ({ ...job }));
    }

    clear(): void {
        this.jobs.clear();
        this.nextId = 1;
    }
}

class MockBackgroundTaskService {
    private queue: MockTaskQueue;
    private workerPool: MockWorkerPool;
    private scheduler: MockScheduler;
    private processors = new Map<string, TaskProcessor>();
    private isProcessing = false;
    private processingInterval?: NodeJS.Timeout;

    constructor() {
        this.queue = new MockTaskQueue();
        this.workerPool = new MockWorkerPool();
        this.scheduler = new MockScheduler();
    }

    async submitTask(taskType: string, payload: any, options?: {
        priority?: Task['priority'];
        scheduledAt?: Date;
        timeout?: number;
        tags?: string[];
        metadata?: Record<string, any>;
    }): Promise<string> {
        return await this.queue.enqueue(taskType, payload, options);
    }

    async submitBulkTasks(tasks: {
        type: string;
        payload: any;
        options?: any;
    }[]): Promise<string[]> {
        const taskIds: string[] = [];
        
        for (const task of tasks) {
            try {
                const taskId = await this.submitTask(task.type, task.payload, task.options);
                taskIds.push(taskId);
            } catch (error) {
                console.error('Failed to submit task:', error);
            }
        }
        
        return taskIds;
    }

    registerProcessor(type: string, handler: (payload: any, context: TaskExecutionContext) => Promise<any>, options?: {
        timeout?: number;
        retryPolicy?: Partial<RetryPolicy>;
    }): void {
        const processor: TaskProcessor = {
            type,
            handler,
            timeout: options?.timeout || 30_000,
            retryPolicy: {
                maxAttempts: 3,
                delay: 1000,
                backoffMultiplier: 2,
                maxDelay: 30_000,
                ...options?.retryPolicy
            }
        };

        this.processors.set(type, processor);
    }

    createWorker(name: string, capabilities: string[], maxConcurrency: number = 1): Worker {
        return this.workerPool.createWorker(name, capabilities, maxConcurrency);
    }

    async startWorker(workerId: string): Promise<boolean> {
        return await this.workerPool.startWorker(workerId);
    }

    async stopWorker(workerId: string): Promise<boolean> {
        return await this.workerPool.stopWorker(workerId);
    }

    scheduleJob(name: string, cronExpression: string, taskType: string, payload: any, metadata?: Record<string, any>): ScheduledJob {
        return this.scheduler.createJob(name, cronExpression, taskType, payload, metadata);
    }

    startProcessing(intervalMs: number = 1000): void {
        if (this.processingInterval) {
            this.stopProcessing();
        }

        this.processingInterval = setInterval(() => {
            this.processQueue();
            this.processScheduledJobs();
        }, intervalMs);
    }

    stopProcessing(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = undefined;
        }
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const availableWorkers = this.workerPool.getAvailableWorkers();
            
            for (const worker of availableWorkers) {
                const task = await this.queue.dequeue(worker.capabilities);
                if (!task) break;

                const assigned = await this.workerPool.assignTask(worker.id, task.id);
                if (!assigned) continue;

                // Process task asynchronously
                this.executeTask(task, worker);
            }
        } finally {
            this.isProcessing = false;
        }
    }

    private async executeTask(task: Task, worker: Worker): Promise<void> {
        const processor = this.processors.get(task.type);
        if (!processor) {
            await this.queue.fail(task.id, `No processor registered for task type: ${task.type}`);
            await this.workerPool.completeTask(worker.id, false);
            return;
        }

        try {
            const context: TaskExecutionContext = {
                taskId: task.id,
                attempt: task.attempts,
                worker,
                signal: new AbortController().signal,
                progress: (percentage: number, message?: string) => {
                    // Mock progress tracking
                }
            };

            const result = await Promise.race([
                processor.handler(task.payload, context),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Task timeout')), task.timeout)
                )
            ]);

            await this.queue.complete(task.id, result);
            await this.workerPool.completeTask(worker.id, true);
        } catch (error) {
            await this.queue.fail(task.id, error.message);
            await this.workerPool.completeTask(worker.id, false);
        }
    }

    private async processScheduledJobs(): Promise<void> {
        const dueJobs = await this.scheduler.getJobsDue();
        
        for (const job of dueJobs) {
            try {
                await this.submitTask(job.taskType, job.payload, {
                    tags: ['scheduled', job.name],
                    metadata: { jobId: job.id, ...job.metadata }
                });
                
                await this.scheduler.markJobExecuted(job.id, true);
            } catch {
                await this.scheduler.markJobExecuted(job.id, false);
            }
        }
    }

    async getTaskStatus(taskId: string): Promise<Task | null> {
        return await this.queue.getTask(taskId);
    }

    async getTaskResult(taskId: string): Promise<TaskResult | null> {
        return await this.queue.getResult(taskId);
    }

    async cancelTask(taskId: string): Promise<boolean> {
        return await this.queue.cancel(taskId);
    }

    async getQueueStats(): Promise<QueueStats> {
        return await this.queue.getStats();
    }

    async getWorkerStats(): Promise<any> {
        return this.workerPool.getWorkerStats();
    }

    async cleanupCompletedTasks(olderThanHours: number = 24): Promise<number> {
        const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
        return await this.queue.cleanup(cutoff);
    }

    reset(): void {
        this.stopProcessing();
        this.queue.clear();
        this.workerPool.clear();
        this.scheduler.clear();
        this.processors.clear();
        this.isProcessing = false;
    }
}

// Helper functions for creating test data
function createTestTasks(count: number, types: string[] = ['email', 'notification', 'backup']): {
    type: string;
    payload: any;
    options?: any;
}[] {
    return Array.from({ length: count }, (_, i) => {
        const type = types[i % types.length];
        return {
            type,
            payload: {
                id: i + 1,
                data: `Test data for task ${i + 1}`,
                timestamp: new Date().toISOString(),
                metadata: { index: i, type }
            },
            options: {
                priority: i % 4 === 0 ? 'high' : 'normal',
                tags: [`batch-${Math.floor(i / 10)}`, type],
                metadata: { batchIndex: i }
            }
        };
    });
}

function createMockProcessor(type: string, processingTime: number = 100): (payload: any, context: TaskExecutionContext) => Promise<any> {
    return async (payload: any, context: TaskExecutionContext) => {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, processingTime));
        
        // Simulate occasional failures
        if (Math.random() < 0.1) { // 10% failure rate
            throw new Error(`Simulated failure for ${type} task`);
        }
        
        return {
            processed: true,
            taskId: context.taskId,
            attempt: context.attempt,
            result: `Processed ${type} task with data: ${payload.data}`,
            timestamp: new Date().toISOString()
        };
    };
}

describe("Background Task Service Performance", () => {
    let service: MockBackgroundTaskService;

    bench("service initialization", () => {
        service = new MockBackgroundTaskService();
    }, { warmupIterations: 10, iterations: 1000 });

    bench("submit single task", () => {
        service = new MockBackgroundTaskService();
        service.submitTask('test-task', { data: 'test data' });
    }, { warmupIterations: 10, iterations: 3000 });

    bench("submit bulk tasks", () => {
        service = new MockBackgroundTaskService();
        const tasks = createTestTasks(20);
        service.submitBulkTasks(tasks);
    }, { warmupIterations: 10, iterations: 1000 });

    bench("register processor", () => {
        service = new MockBackgroundTaskService();
        const processor = createMockProcessor('email', 50);
        service.registerProcessor('email', processor);
    }, { warmupIterations: 10, iterations: 5000 });

    bench("create worker", () => {
        service = new MockBackgroundTaskService();
        service.createWorker('test-worker', ['email', 'notification'], 2);
    }, { warmupIterations: 10, iterations: 4000 });

    bench("task queue operations", () => {
        service = new MockBackgroundTaskService();
        
        // Create workers and processors
        const emailWorker = service.createWorker('email-worker', ['email'], 1);
        service.registerProcessor('email', createMockProcessor('email', 10));
        service.startWorker(emailWorker.id);
        
        // Submit tasks
        const tasks = createTestTasks(10, ['email']);
        service.submitBulkTasks(tasks);
    }, { warmupIterations: 10, iterations: 800 });

    bench("task processing simulation", () => {
        service = new MockBackgroundTaskService();
        
        // Setup
        const worker = service.createWorker('processor', ['process'], 1);
        service.registerProcessor('process', createMockProcessor('process', 5));
        service.startWorker(worker.id);
        
        // Submit and process
        service.submitTask('process', { data: 'test' }).then(() => {
            service['processQueue']();
        });
    }, { warmupIterations: 10, iterations: 2000 });

    bench("priority queue handling", () => {
        service = new MockBackgroundTaskService();
        
        const worker = service.createWorker('priority-worker', ['urgent', 'normal', 'low'], 1);
        ['urgent', 'normal', 'low'].forEach(type => {
            service.registerProcessor(type, createMockProcessor(type, 5));
        });
        service.startWorker(worker.id);
        
        // Submit tasks with different priorities
        const urgentTasks = service.submitTask('urgent', { data: 'urgent' }, { priority: 'urgent' });
        const normalTasks = service.submitTask('normal', { data: 'normal' }, { priority: 'normal' });
        const lowTasks = service.submitTask('low', { data: 'low' }, { priority: 'low' });
        
        Promise.all([urgentTasks, normalTasks, lowTasks]).then(() => {
            service['processQueue']();
        });
    }, { warmupIterations: 10, iterations: 1500 });

    bench("scheduled job creation", () => {
        service = new MockBackgroundTaskService();
        service.scheduleJob(
            'daily-report',
            '0 0 * * *',
            'report',
            { type: 'daily', recipients: ['admin@test.com'] },
            { category: 'reporting' }
        );
    }, { warmupIterations: 10, iterations: 2000 });

    bench("scheduled job processing", () => {
        service = new MockBackgroundTaskService();
        
        service.registerProcessor('scheduled', createMockProcessor('scheduled', 5));
        
        // Create multiple scheduled jobs
        for (let i = 0; i < 5; i++) {
            service.scheduleJob(
                `job-${i}`,
                '* * * * *', // Every minute (will be due immediately)
                'scheduled',
                { jobIndex: i }
            );
        }
        
        service['processScheduledJobs']();
    }, { warmupIterations: 10, iterations: 1200 });

    bench("multi-worker processing", () => {
        service = new MockBackgroundTaskService();
        
        // Create multiple workers
        const workers: Worker[] = [];
        for (let i = 0; i < 3; i++) {
            const worker = service.createWorker(`worker-${i}`, ['multi'], 2);
            workers.push(worker);
            service.startWorker(worker.id);
        }
        
        service.registerProcessor('multi', createMockProcessor('multi', 10));
        
        // Submit many tasks
        const tasks = createTestTasks(15, ['multi']);
        service.submitBulkTasks(tasks).then(() => {
            service['processQueue']();
        });
    }, { warmupIterations: 10, iterations: 600 });

    bench("task retry mechanism", () => {
        service = new MockBackgroundTaskService();
        
        const worker = service.createWorker('retry-worker', ['failing'], 1);
        service.startWorker(worker.id);
        
        // Register processor that always fails initially
        let attemptCount = 0;
        service.registerProcessor('failing', async (payload: any, context: TaskExecutionContext) => {
            attemptCount++;
            if (attemptCount <= 2) {
                throw new Error('Simulated failure');
            }
            return { success: true, attempts: attemptCount };
        });
        
        service.submitTask('failing', { data: 'retry test' }, { 
            metadata: { shouldRetry: true } 
        }).then(() => {
            // Process multiple times to handle retries
            service['processQueue']();
        });
    }, { warmupIterations: 10, iterations: 1000 });

    bench("task cancellation", () => {
        service = new MockBackgroundTaskService();
        
        // Submit tasks
        const tasks = Array.from({ length: 10 }, (_, i) => 
            service.submitTask('cancel-test', { index: i })
        );
        
        Promise.all(tasks).then(taskIds => {
            // Cancel half the tasks
            const cancelPromises = taskIds.slice(0, 5).map(id => 
                service.cancelTask(id)
            );
            Promise.all(cancelPromises);
        });
    }, { warmupIterations: 10, iterations: 1500 });

    bench("queue statistics", () => {
        service = new MockBackgroundTaskService();
        
        const worker = service.createWorker('stats-worker', ['stats'], 1);
        service.registerProcessor('stats', createMockProcessor('stats', 5));
        service.startWorker(worker.id);
        
        const tasks = createTestTasks(25, ['stats']);
        service.submitBulkTasks(tasks).then(() => {
            service.getQueueStats();
        });
    }, { warmupIterations: 10, iterations: 1200 });

    bench("worker statistics", () => {
        service = new MockBackgroundTaskService();
        
        // Create multiple workers with different capabilities
        const workers = [
            service.createWorker('email-worker', ['email'], 2),
            service.createWorker('notification-worker', ['notification'], 1),
            service.createWorker('multi-worker', ['email', 'notification'], 3)
        ];
        
        workers.forEach(worker => service.startWorker(worker.id));
        
        ['email', 'notification'].forEach(type => {
            service.registerProcessor(type, createMockProcessor(type, 5));
        });
        
        service.getWorkerStats();
    }, { warmupIterations: 10, iterations: 2000 });

    bench("task status tracking", () => {
        service = new MockBackgroundTaskService();
        
        const worker = service.createWorker('tracking-worker', ['track'], 1);
        service.registerProcessor('track', createMockProcessor('track', 20));
        service.startWorker(worker.id);
        
        service.submitTask('track', { data: 'tracking test' }).then(taskId => {
            // Check status multiple times
            const statusChecks = Array.from({ length: 5 }, () => 
                service.getTaskStatus(taskId)
            );
            Promise.all(statusChecks);
        });
    }, { warmupIterations: 10, iterations: 1500 });

    bench("task result retrieval", () => {
        service = new MockBackgroundTaskService();
        
        const worker = service.createWorker('result-worker', ['result'], 1);
        service.registerProcessor('result', createMockProcessor('result', 5));
        service.startWorker(worker.id);
        
        service.submitTask('result', { data: 'result test' }).then(taskId => {
            // Process the task
            service['processQueue']().then(() => {
                // Retrieve result
                service.getTaskResult(taskId);
            });
        });
    }, { warmupIterations: 10, iterations: 1500 });

    bench("continuous processing simulation", () => {
        service = new MockBackgroundTaskService();
        
        // Setup workers and processors
        const worker = service.createWorker('continuous', ['continuous'], 2);
        service.registerProcessor('continuous', createMockProcessor('continuous', 10));
        service.startWorker(worker.id);
        
        // Start processing
        service.startProcessing(50); // Process every 50ms
        
        // Submit tasks continuously
        const tasks = createTestTasks(15, ['continuous']);
        service.submitBulkTasks(tasks).then(() => {
            // Stop after short time
            setTimeout(() => {
                service.stopProcessing();
            }, 100);
        });
    }, { warmupIterations: 5, iterations: 100 });

    bench("cleanup completed tasks", () => {
        service = new MockBackgroundTaskService();
        
        const worker = service.createWorker('cleanup-worker', ['cleanup'], 1);
        service.registerProcessor('cleanup', createMockProcessor('cleanup', 5));
        service.startWorker(worker.id);
        
        const tasks = createTestTasks(20, ['cleanup']);
        service.submitBulkTasks(tasks).then(() => {
            // Process all tasks
            service['processQueue']().then(() => {
                // Cleanup
                service.cleanupCompletedTasks(0); // Cleanup immediately
            });
        });
    }, { warmupIterations: 10, iterations: 600 });

    bench("service reset", () => {
        service = new MockBackgroundTaskService();
        
        // Create full setup
        const workers = [
            service.createWorker('worker-1', ['type1'], 1),
            service.createWorker('worker-2', ['type2'], 1)
        ];
        
        workers.forEach(worker => service.startWorker(worker.id));
        
        ['type1', 'type2'].forEach(type => {
            service.registerProcessor(type, createMockProcessor(type, 5));
        });
        
        service.scheduleJob('test-job', '0 * * * *', 'type1', { data: 'test' });
        
        const tasks = createTestTasks(10, ['type1', 'type2']);
        service.submitBulkTasks(tasks).then(() => {
            service.startProcessing();
            service.reset();
        });
    }, { warmupIterations: 10, iterations: 400 });
});
