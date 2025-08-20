---
mode: "agent"
tools: ['Best Tools']
description: "Generate database migration and testing utilities"
---

Create database migration and testing utilities for: ${input:migrationPurpose}

Requirements:

- Create SQLite migration scripts
- Include rollback procedures
- Add migration testing and validation
- Support data seeding for tests
- Include schema validation
- Create migration utilities and helpers
- Add performance testing for large datasets
- Include data integrity checks

Migration Structure:

- Sequential numbering and naming
- Clear up and down migration scripts
- Schema change documentation
- Data transformation scripts
- Index creation and optimization
- Foreign key constraint management
- Trigger and view updates

Testing Requirements:

- Test migration up and down procedures
- Validate schema changes
- Test data integrity during migration
- Check performance impact
- Test with various data volumes
- Validate foreign key constraints
- Test concurrent access during migration

Data Seeding:

- Create realistic test data
- Support different data volumes
- Include edge case data
- Support multiple environments
- Clean data creation utilities
- Referential integrity maintenance

Validation Tools:

- Schema comparison utilities
- Data integrity verification
- Performance benchmarking
- Migration rollback testing
- Backup and restore procedures
- Change impact analysis

Migration Utilities:

- Migration runner with logging
- Schema version tracking
- Backup creation before migration
- Progress reporting and monitoring
- Error handling and recovery
- Dry-run capabilities for testing

Testing Framework:

- Before/after schema validation
- Data migration verification
- Performance regression testing
- Rollback procedure validation
- Multi-version upgrade testing
- Database consistency checks

Documentation:

- Migration purpose and impact
- Rollback procedures
- Performance considerations
- Breaking change notifications
- Testing requirements
- Deployment instructions

Safety Measures:

- Automated backup creation
- Migration validation checks
- Rollback capability verification
- Data loss prevention
- Performance impact monitoring
- Change approval workflow
