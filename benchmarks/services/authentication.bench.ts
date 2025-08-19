/**
 * Authentication and Authorization Service Performance Benchmarks
 *
 * @file Performance benchmarks for user authentication, authorization, and session management.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Services-Authentication
 * @tags ["performance", "services", "authentication", "authorization", "security"]
 */

import { bench, describe } from "vitest";

interface User {
    id: string;
    username: string;
    email: string;
    hashedPassword: string;
    roles: string[];
    permissions: string[];
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, any>;
}

interface Session {
    id: string;
    userId: string;
    token: string;
    refreshToken: string;
    expiresAt: Date;
    createdAt: Date;
    ipAddress?: string;
    userAgent?: string;
    isActive: boolean;
}

interface LoginRequest {
    username: string;
    password: string;
    rememberMe?: boolean;
    ipAddress?: string;
    userAgent?: string;
}

interface LoginResponse {
    user: Omit<User, 'hashedPassword'>;
    session: Session;
    accessToken: string;
    refreshToken: string;
}

interface Permission {
    id: string;
    name: string;
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystemRole: boolean;
}

interface AuthorizationContext {
    userId: string;
    roles: string[];
    permissions: string[];
    sessionId: string;
    ipAddress?: string;
}

class MockPasswordService {
    async hash(password: string): Promise<string> {
        // Simulate bcrypt-like hashing
        const salt = Math.random().toString(36).substring(2, 15);
        return `$2b$10$${salt}$${this.simpleHash(password + salt)}`;
    }

    async verify(password: string, hashedPassword: string): Promise<boolean> {
        // Simulate password verification
        const parts = hashedPassword.split('$');
        if (parts.length !== 4) return false;
        
        const salt = parts[2];
        const hash = parts[3];
        return hash === this.simpleHash(password + salt);
    }

    private simpleHash(input: string): string {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
}

class MockTokenService {
    private secretKey = 'mock-secret-key';

    generateAccessToken(payload: any): string {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const body = btoa(JSON.stringify({
            ...payload,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
        }));
        const signature = this.generateSignature(`${header}.${body}`);
        return `${header}.${body}.${signature}`;
    }

    generateRefreshToken(): string {
        return Array.from({ length: 64 }, () => 
            Math.random().toString(36).charAt(2)
        ).join('');
    }

    verifyToken(token: string): any {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            const signature = parts[2];

            // Verify signature
            if (this.generateSignature(`${parts[0]}.${parts[1]}`) !== signature) {
                return null;
            }

            // Check expiration
            if (payload.exp < Math.floor(Date.now() / 1000)) {
                return null;
            }

            return payload;
        } catch (error) {
            return null;
        }
    }

    private generateSignature(data: string): string {
        // Simple signature generation for testing
        let hash = 0;
        const combined = data + this.secretKey;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
}

class MockUserRepository {
    private users: Map<string, User> = new Map();
    private nextId = 1;

    async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const id = `user-${this.nextId++}`;
        const now = new Date();
        
        const user: User = {
            id,
            ...userData,
            createdAt: now,
            updatedAt: now
        };
        
        this.users.set(id, user);
        return { ...user };
    }

    async findById(id: string): Promise<User | null> {
        const user = this.users.get(id);
        return user ? { ...user } : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.username === username) {
                return { ...user };
            }
        }
        return null;
    }

    async findByEmail(email: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return { ...user };
            }
        }
        return null;
    }

    async update(id: string, updates: Partial<User>): Promise<User | null> {
        const user = this.users.get(id);
        if (!user) return null;
        
        const updatedUser = {
            ...user,
            ...updates,
            updatedAt: new Date()
        };
        
        this.users.set(id, updatedUser);
        return { ...updatedUser };
    }

    clear(): void {
        this.users.clear();
        this.nextId = 1;
    }
}

class MockSessionRepository {
    private sessions: Map<string, Session> = new Map();
    private nextId = 1;

    async create(sessionData: Omit<Session, 'id' | 'createdAt'>): Promise<Session> {
        const id = `session-${this.nextId++}`;
        const session: Session = {
            id,
            ...sessionData,
            createdAt: new Date()
        };
        
        this.sessions.set(id, session);
        return { ...session };
    }

    async findByToken(token: string): Promise<Session | null> {
        for (const session of this.sessions.values()) {
            if (session.token === token) {
                return { ...session };
            }
        }
        return null;
    }

    async findByUserId(userId: string): Promise<Session[]> {
        return Array.from(this.sessions.values())
            .filter(session => session.userId === userId && session.isActive)
            .map(session => ({ ...session }));
    }

    async update(id: string, updates: Partial<Session>): Promise<Session | null> {
        const session = this.sessions.get(id);
        if (!session) return null;
        
        const updatedSession = { ...session, ...updates };
        this.sessions.set(id, updatedSession);
        return { ...updatedSession };
    }

    async delete(id: string): Promise<boolean> {
        return this.sessions.delete(id);
    }

    async deleteByUserId(userId: string): Promise<number> {
        let deleted = 0;
        for (const [id, session] of this.sessions) {
            if (session.userId === userId) {
                this.sessions.delete(id);
                deleted++;
            }
        }
        return deleted;
    }

    async cleanup(): Promise<number> {
        const now = new Date();
        let cleaned = 0;
        
        for (const [id, session] of this.sessions) {
            if (session.expiresAt < now) {
                this.sessions.delete(id);
                cleaned++;
            }
        }
        
        return cleaned;
    }

    clear(): void {
        this.sessions.clear();
        this.nextId = 1;
    }
}

class MockPermissionService {
    private permissions: Map<string, Permission> = new Map();
    private roles: Map<string, Role> = new Map();

    constructor() {
        this.initializeDefaultRoles();
    }

    hasPermission(context: AuthorizationContext, resource: string, action: string): boolean {
        // Check direct permissions
        const directPermission = `${resource}:${action}`;
        if (context.permissions.includes(directPermission)) {
            return true;
        }
        
        // Check role-based permissions
        for (const roleName of context.roles) {
            const role = this.roles.get(roleName);
            if (!role) continue;
            
            for (const permissionId of role.permissions) {
                const permission = this.permissions.get(permissionId);
                if (permission && 
                    permission.resource === resource && 
                    permission.action === action) {
                    return true;
                }
            }
        }
        
        return false;
    }

    getUserPermissions(roles: string[]): string[] {
        const permissions = new Set<string>();
        
        for (const roleName of roles) {
            const role = this.roles.get(roleName);
            if (!role) continue;
            
            for (const permissionId of role.permissions) {
                const permission = this.permissions.get(permissionId);
                if (permission) {
                    permissions.add(`${permission.resource}:${permission.action}`);
                }
            }
        }
        
        return Array.from(permissions);
    }

    private initializeDefaultRoles(): void {
        // Create permissions
        const permissions = [
            { id: 'p1', name: 'Read Sites', resource: 'sites', action: 'read' },
            { id: 'p2', name: 'Create Sites', resource: 'sites', action: 'create' },
            { id: 'p3', name: 'Update Sites', resource: 'sites', action: 'update' },
            { id: 'p4', name: 'Delete Sites', resource: 'sites', action: 'delete' },
            { id: 'p5', name: 'Read Monitors', resource: 'monitors', action: 'read' },
            { id: 'p6', name: 'Create Monitors', resource: 'monitors', action: 'create' },
            { id: 'p7', name: 'Update Monitors', resource: 'monitors', action: 'update' },
            { id: 'p8', name: 'Delete Monitors', resource: 'monitors', action: 'delete' },
            { id: 'p9', name: 'Admin Panel', resource: 'admin', action: 'access' },
            { id: 'p10', name: 'User Management', resource: 'users', action: 'manage' }
        ];
        
        permissions.forEach(p => this.permissions.set(p.id, p as Permission));
        
        // Create roles
        this.roles.set('viewer', {
            id: 'r1',
            name: 'viewer',
            description: 'Can view sites and monitors',
            permissions: ['p1', 'p5'],
            isSystemRole: true
        });
        
        this.roles.set('operator', {
            id: 'r2',
            name: 'operator',
            description: 'Can manage sites and monitors',
            permissions: ['p1', 'p2', 'p3', 'p5', 'p6', 'p7'],
            isSystemRole: true
        });
        
        this.roles.set('admin', {
            id: 'r3',
            name: 'admin',
            description: 'Full access to all resources',
            permissions: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'],
            isSystemRole: true
        });
    }
}

class MockAuthenticationService {
    private userRepository: MockUserRepository;
    private sessionRepository: MockSessionRepository;
    private passwordService: MockPasswordService;
    private tokenService: MockTokenService;
    private permissionService: MockPermissionService;

    constructor() {
        this.userRepository = new MockUserRepository();
        this.sessionRepository = new MockSessionRepository();
        this.passwordService = new MockPasswordService();
        this.tokenService = new MockTokenService();
        this.permissionService = new MockPermissionService();
    }

    async login(request: LoginRequest): Promise<LoginResponse> {
        // Find user
        const user = await this.userRepository.findByUsername(request.username);
        if (!user || !user.isActive) {
            throw new Error('Invalid credentials');
        }
        
        // Verify password
        const passwordValid = await this.passwordService.verify(request.password, user.hashedPassword);
        if (!passwordValid) {
            throw new Error('Invalid credentials');
        }
        
        // Generate tokens
        const accessToken = this.tokenService.generateAccessToken({
            userId: user.id,
            username: user.username,
            roles: user.roles
        });
        
        const refreshToken = this.tokenService.generateRefreshToken();
        
        // Create session
        const expiresAt = new Date(Date.now() + (request.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
        
        const session = await this.sessionRepository.create({
            userId: user.id,
            token: accessToken,
            refreshToken,
            expiresAt,
            ipAddress: request.ipAddress,
            userAgent: request.userAgent,
            isActive: true
        });
        
        // Update last login
        await this.userRepository.update(user.id, {
            lastLoginAt: new Date()
        });
        
        const { hashedPassword, ...userWithoutPassword } = user;
        
        return {
            user: userWithoutPassword,
            session,
            accessToken,
            refreshToken
        };
    }

    async logout(sessionId: string): Promise<void> {
        const session = await this.sessionRepository.findByToken(sessionId);
        if (session) {
            await this.sessionRepository.update(session.id, { isActive: false });
        }
    }

    async logoutAllSessions(userId: string): Promise<void> {
        await this.sessionRepository.deleteByUserId(userId);
    }

    async verifyToken(token: string): Promise<AuthorizationContext | null> {
        const payload = this.tokenService.verifyToken(token);
        if (!payload) return null;
        
        const session = await this.sessionRepository.findByToken(token);
        if (!session || !session.isActive || session.expiresAt < new Date()) {
            return null;
        }
        
        const user = await this.userRepository.findById(payload.userId);
        if (!user || !user.isActive) return null;
        
        const permissions = this.permissionService.getUserPermissions(user.roles);
        
        return {
            userId: user.id,
            roles: user.roles,
            permissions,
            sessionId: session.id,
            ipAddress: session.ipAddress
        };
    }

    async refreshSession(refreshToken: string): Promise<LoginResponse> {
        // Find session by refresh token
        let targetSession: Session | null = null;
        for (const session of (await this.sessionRepository['sessions']).values()) {
            if (session.refreshToken === refreshToken && session.isActive) {
                targetSession = session;
                break;
            }
        }
        
        if (!targetSession || targetSession.expiresAt < new Date()) {
            throw new Error('Invalid refresh token');
        }
        
        const user = await this.userRepository.findById(targetSession.userId);
        if (!user || !user.isActive) {
            throw new Error('User not found or inactive');
        }
        
        // Generate new tokens
        const accessToken = this.tokenService.generateAccessToken({
            userId: user.id,
            username: user.username,
            roles: user.roles
        });
        
        const newRefreshToken = this.tokenService.generateRefreshToken();
        
        // Update session
        const updatedSession = await this.sessionRepository.update(targetSession.id, {
            token: accessToken,
            refreshToken: newRefreshToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
        
        const { hashedPassword, ...userWithoutPassword } = user;
        
        return {
            user: userWithoutPassword,
            session: updatedSession!,
            accessToken,
            refreshToken: newRefreshToken
        };
    }

    async checkPermission(context: AuthorizationContext, resource: string, action: string): Promise<boolean> {
        return this.permissionService.hasPermission(context, resource, action);
    }

    async createUser(userData: {
        username: string;
        email: string;
        password: string;
        roles?: string[];
    }): Promise<User> {
        // Check for existing user
        const existingUser = await this.userRepository.findByUsername(userData.username);
        if (existingUser) {
            throw new Error('Username already exists');
        }
        
        const existingEmail = await this.userRepository.findByEmail(userData.email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }
        
        // Hash password
        const hashedPassword = await this.passwordService.hash(userData.password);
        
        // Create user
        const user = await this.userRepository.create({
            username: userData.username,
            email: userData.email,
            hashedPassword,
            roles: userData.roles || ['viewer'],
            permissions: this.permissionService.getUserPermissions(userData.roles || ['viewer']),
            isActive: true,
            metadata: {}
        });
        
        return user;
    }

    async cleanupExpiredSessions(): Promise<number> {
        return await this.sessionRepository.cleanup();
    }

    getStats(): any {
        return {
            activeUsers: Array.from(this.userRepository['users'].values()).filter(u => u.isActive).length,
            totalUsers: this.userRepository['users'].size,
            activeSessions: Array.from(this.sessionRepository['sessions'].values()).filter(s => s.isActive).length,
            totalSessions: this.sessionRepository['sessions'].size
        };
    }

    reset(): void {
        this.userRepository.clear();
        this.sessionRepository.clear();
    }
}

// Helper functions for creating test data
function createTestUser(index: number): {
    username: string;
    email: string;
    password: string;
    roles: string[];
} {
    return {
        username: `user${index}`,
        email: `user${index}@example.com`,
        password: `password${index}`,
        roles: index % 3 === 0 ? ['admin'] : index % 2 === 0 ? ['operator'] : ['viewer']
    };
}

function createLoginRequest(username: string, password: string): LoginRequest {
    return {
        username,
        password,
        rememberMe: Math.random() > 0.5,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Test User Agent'
    };
}

describe("Authentication Service Performance", () => {
    let service: MockAuthenticationService;

    bench("service initialization", () => {
        service = new MockAuthenticationService();
    }, { warmupIterations: 10, iterations: 1000 });

    bench("create user", () => {
        service = new MockAuthenticationService();
        const userData = createTestUser(1);
        service.createUser(userData);
    }, { warmupIterations: 10, iterations: 2000 });

    bench("login user", () => {
        service = new MockAuthenticationService();
        const userData = createTestUser(1);
        service.createUser(userData).then(() => {
            const loginRequest = createLoginRequest(userData.username, userData.password);
            service.login(loginRequest);
        });
    }, { warmupIterations: 10, iterations: 1000 });

    bench("verify token", () => {
        service = new MockAuthenticationService();
        const userData = createTestUser(1);
        service.createUser(userData).then(() => {
            const loginRequest = createLoginRequest(userData.username, userData.password);
            service.login(loginRequest).then(response => {
                service.verifyToken(response.accessToken);
            });
        });
    }, { warmupIterations: 10, iterations: 3000 });

    bench("check permission", () => {
        service = new MockAuthenticationService();
        const userData = createTestUser(1);
        service.createUser(userData).then(() => {
            const loginRequest = createLoginRequest(userData.username, userData.password);
            service.login(loginRequest).then(response => {
                service.verifyToken(response.accessToken).then(context => {
                    if (context) {
                        service.checkPermission(context, 'sites', 'read');
                    }
                });
            });
        });
    }, { warmupIterations: 10, iterations: 4000 });

    bench("logout user", () => {
        service = new MockAuthenticationService();
        const userData = createTestUser(1);
        service.createUser(userData).then(() => {
            const loginRequest = createLoginRequest(userData.username, userData.password);
            service.login(loginRequest).then(response => {
                service.logout(response.session.id);
            });
        });
    }, { warmupIterations: 10, iterations: 2000 });

    bench("refresh session", () => {
        service = new MockAuthenticationService();
        const userData = createTestUser(1);
        service.createUser(userData).then(() => {
            const loginRequest = createLoginRequest(userData.username, userData.password);
            service.login(loginRequest).then(response => {
                service.refreshSession(response.refreshToken);
            });
        });
    }, { warmupIterations: 10, iterations: 1500 });

    bench("password hashing", () => {
        service = new MockAuthenticationService();
        const passwordService = service['passwordService'];
        passwordService.hash('test-password-123');
    }, { warmupIterations: 10, iterations: 1000 });

    bench("password verification", () => {
        service = new MockAuthenticationService();
        const passwordService = service['passwordService'];
        passwordService.hash('test-password-123').then(hash => {
            passwordService.verify('test-password-123', hash);
        });
    }, { warmupIterations: 10, iterations: 1500 });

    bench("token generation", () => {
        service = new MockAuthenticationService();
        const tokenService = service['tokenService'];
        tokenService.generateAccessToken({
            userId: 'user-1',
            username: 'testuser',
            roles: ['operator']
        });
    }, { warmupIterations: 10, iterations: 5000 });

    bench("token verification", () => {
        service = new MockAuthenticationService();
        const tokenService = service['tokenService'];
        const token = tokenService.generateAccessToken({
            userId: 'user-1',
            username: 'testuser',
            roles: ['operator']
        });
        tokenService.verifyToken(token);
    }, { warmupIterations: 10, iterations: 6000 });

    bench("multiple user creation", () => {
        service = new MockAuthenticationService();
        const users = Array.from({ length: 20 }, (_, i) => createTestUser(i + 1));
        
        Promise.all(users.map(user => service.createUser(user)));
    }, { warmupIterations: 5, iterations: 200 });

    bench("concurrent logins", () => {
        service = new MockAuthenticationService();
        const users = Array.from({ length: 10 }, (_, i) => createTestUser(i + 1));
        
        Promise.all(users.map(user => service.createUser(user))).then(() => {
            const logins = users.map(user => {
                const loginRequest = createLoginRequest(user.username, user.password);
                return service.login(loginRequest);
            });
            Promise.all(logins);
        });
    }, { warmupIterations: 5, iterations: 300 });

    bench("permission checks with different roles", () => {
        service = new MockAuthenticationService();
        const adminUser = { ...createTestUser(1), roles: ['admin'] };
        const operatorUser = { ...createTestUser(2), roles: ['operator'] };
        const viewerUser = { ...createTestUser(3), roles: ['viewer'] };
        
        Promise.all([
            service.createUser(adminUser),
            service.createUser(operatorUser),
            service.createUser(viewerUser)
        ]).then(() => {
            const loginPromises = [
                service.login(createLoginRequest(adminUser.username, adminUser.password)),
                service.login(createLoginRequest(operatorUser.username, operatorUser.password)),
                service.login(createLoginRequest(viewerUser.username, viewerUser.password))
            ];
            
            Promise.all(loginPromises).then(responses => {
                const verifyPromises = responses.map(response => 
                    service.verifyToken(response.accessToken)
                );
                
                Promise.all(verifyPromises).then(contexts => {
                    const permissionChecks = contexts.map(context => {
                        if (context) {
                            return Promise.all([
                                service.checkPermission(context, 'sites', 'read'),
                                service.checkPermission(context, 'sites', 'create'),
                                service.checkPermission(context, 'admin', 'access')
                            ]);
                        }
                        return Promise.resolve([]);
                    });
                    
                    Promise.all(permissionChecks);
                });
            });
        });
    }, { warmupIterations: 5, iterations: 100 });

    bench("session cleanup", () => {
        service = new MockAuthenticationService();
        const users = Array.from({ length: 15 }, (_, i) => createTestUser(i + 1));
        
        Promise.all(users.map(user => service.createUser(user))).then(() => {
            const logins = users.map(user => {
                const loginRequest = createLoginRequest(user.username, user.password);
                return service.login(loginRequest);
            });
            
            Promise.all(logins).then(() => {
                service.cleanupExpiredSessions();
            });
        });
    }, { warmupIterations: 5, iterations: 200 });

    bench("logout all sessions", () => {
        service = new MockAuthenticationService();
        const userData = createTestUser(1);
        
        service.createUser(userData).then(user => {
            // Create multiple sessions
            const logins = Array.from({ length: 5 }, () => {
                const loginRequest = createLoginRequest(userData.username, userData.password);
                return service.login(loginRequest);
            });
            
            Promise.all(logins).then(() => {
                service.logoutAllSessions(user.id);
            });
        });
    }, { warmupIterations: 10, iterations: 500 });

    bench("service statistics", () => {
        service = new MockAuthenticationService();
        const users = Array.from({ length: 10 }, (_, i) => createTestUser(i + 1));
        
        Promise.all(users.map(user => service.createUser(user))).then(() => {
            service.getStats();
        });
    }, { warmupIterations: 10, iterations: 1000 });

    bench("service reset", () => {
        service = new MockAuthenticationService();
        const users = Array.from({ length: 8 }, (_, i) => createTestUser(i + 1));
        
        Promise.all(users.map(user => service.createUser(user))).then(() => {
            service.reset();
        });
    }, { warmupIterations: 10, iterations: 800 });
});
