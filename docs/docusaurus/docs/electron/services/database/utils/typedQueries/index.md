# electron/services/database/utils/typedQueries

Type-safe database query helpers to eliminate unsafe type assertions.

## Remarks

These helpers provide compile-time type safety for database operations while
maintaining runtime safety through controlled SQL queries. This centralizes
the inevitable type assertions required when working with SQLite's untyped
results.

## Interfaces

- [CountResult](interfaces/CountResult.md)
- [IdOnlyResult](interfaces/IdOnlyResult.md)

## Functions

- [insertWithReturning](functions/insertWithReturning.md)
- [queryForCount](functions/queryForCount.md)
- [queryForIds](functions/queryForIds.md)
- [queryForRecords](functions/queryForRecords.md)
- [queryForSingleRecord](functions/queryForSingleRecord.md)
