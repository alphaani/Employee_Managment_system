# Database Schema Design — Employee Management System

> **Architect:** Senior MongoDB Architect  
> **ODM:** Mongoose v8+  
> **Database:** MongoDB Atlas (M40+ cluster recommended)

---

## Table of Contents

1. [Entity Relationship Diagram](#1-entity-relationship-diagram)
2. [Schema Design Explanation](#2-schema-design-explanation)
3. [Relationship Explanation](#3-relationship-explanation)
4. [Optimization Suggestions](#4-optimization-suggestions)

---

## 1. Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   ┌──────────────────────┐          ┌──────────────────────┐                    │
│   │       ADMIN          │          │     DEPARTMENT       │                    │
│   │──────────────────────│          │──────────────────────│                    │
│   │ _id          (PK)    │          │ _id          (PK)    │                    │
│   │ fullName             │          │ departmentName       │──┐                 │
│   │ email        (UQ)    │          │ description          │  │                 │
│   │ password     (H)     │          │ manager              │  │                 │
│   │ role                 │          │ createdAt            │  │ 1               │
│   │ createdAt            │          │ updatedAt            │  │                 │
│   └──────────────────────┘          └──────────────────────┘  │                 │
│                                                                  │                 │
│   (Standalone — no refs)                                          │ has many        │
│                                                                  ▼                 │
│                                          ┌──────────────────────────────────────┐  │
│                                          │              EMPLOYEE                │  │
│                                          │──────────────────────────────────────│  │
│                                          │ _id                   (PK)           │  │
│               ┌──────────────────────────┤ fullName                             │──┘
│               │                          │ email                (UQ)           │
│               │ 1 has many               │ password             (H, SF)        │
│               ▼                          │ phoneNumber                          │
│   ┌──────────────────────┐              │ gender               (E)            │
│   │     ATTENDANCE       │              │ position                             │
│   │──────────────────────│              │ departmentId         (FK) ──────────┘
│   │ _id          (PK)    │              │ salary                               │
│   │ employeeId   (FK) ──┤              │ profileImage                         │
│   │ checkInTime          │              │ joiningDate                          │
│   │ checkOutTime         │              │ status               (E)            │
│   │ date                 │              │ role                                 │
│   │ status      (E)      │              │ createdAt                            │
│   │ createdAt            │              │ updatedAt                            │
│   └──────────────────────┘              └──┬──────────┬──────────┬──────────┬──┘
│                                            │          │          │          │
│                                            │ 1 has    │ 1 has    │ 1 has    │ 1 has
│                                            │ many     │ many     │ many     │ many
│                                            ▼          ▼          ▼          ▼
│                                      ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────────┐
│                                      │ PAYROLL │ │  LEAVE  │ │ATTEND- │ │PERFORMANCE │
│                                      │         │ │         │ │ANCE     │ │            │
│                                      │───────  │ │───────  │ │(see     │ │────────    │
│                                      │_id (PK) │ │_id (PK) │ │above)   │ │_id     (PK)│
│                                      │empId(FK)│ │empId(FK)│ │         │ │empId  (FK) │
│                                      │basicSal │ │leaveType│ │         │ │rating      │
│                                      │bonus    │ │startDate│ │         │ │feedback    │
│                                      │deduction│ │endDate  │ │         │ │evalDate    │
│                                      │totalSal │ │reason   │ │         │ │createdAt   │
│                                      │payDate  │ │status(E)│ │         │ └────────────┘
│                                      │status(E)│ │createdAt│ │         │
│                                      │createdAt│ │updatedAt│ │         │
│                                      └─────────┘ └─────────┘ └─────────┘
│
│   LEGEND:
│   (PK)  = Primary Key  — MongoDB _id
│   (FK)  = Foreign Key  — ObjectId reference
│   (UQ)  = Unique Index
│   (H)   = Hashed (bcryptjs, 12 rounds)
│   (SF)  = select: false  (excluded from queries by default)
│   (E)   = Enum validation
│   ────  = One-to-Many relationship
│
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Cardinality Summary

| Parent | Child | Type | Direction |
|--------|-------|------|-----------|
| Department | Employee | 1 : N | Department._id ← Employee.departmentId |
| Employee | Attendance | 1 : N | Employee._id ← Attendance.employeeId |
| Employee | Payroll | 1 : N | Employee._id ← Payroll.employeeId |
| Employee | Leave | 1 : N | Employee._id ← Leave.employeeId |
| Employee | Performance | 1 : N | Employee._id ← Performance.employeeId |
| Admin | — | — | Standalone (no child refs) |

---

## 2. Schema Design Explanation

### 2.1 Design Philosophy

Each entity maps to a single MongoDB collection. References (foreign keys) are stored as `ObjectId` on the child document. This is the **referenced** pattern (as opposed to embedded), chosen because:

| Criterion | Referenced (chosen) | Embedded |
|-----------|---------------------|----------|
| Data growth | Unbounded (employee → attendance) | Would exceed 16MB doc limit |
| Independent updates | Employee vs Payroll change independently | Would require rewriting parent |
| Query isolation | "All leaves with status=pending" — single query | Would need aggregation unwind |
| Write frequency | Attendance checked daily — high writes | Would cause constant parent updates |

### 2.2 Schema Breakdown

#### Department (`Department.js`)
- **Purpose:** Organizational unit that groups employees.
- **Key decisions:**
  - `departmentName` is `unique` — prevents duplicate departments at the DB level.
  - Virtual fields `employees` and `employeeCount` provide read-time access to related employees without storing an array.
  - `manager` is a simple string (name) rather than an Employee ref — simplifying the model. If manager assignment becomes complex, change to `ObjectId` ref.
- **Indexes:** `{ departmentName: 1 }` — covers uniqueness enforcement and alphabetical listing queries.

#### Employee (`Employee.js`)
- **Purpose:** Core entity. All other modules reference this.
- **Key decisions:**
  - `password` has `select: false` — never returned in queries unless explicitly requested with `.select('+password')`.
  - `departmentId` is a nullable `ObjectId` ref — an employee can exist without a department (e.g., during onboarding).
  - Pre-save hook hashes password with bcryptjs (12 rounds) — only when `password` is modified.
  - `comparePassword()` instance method encapsulates bcrypt comparison.
  - `toJSON()` override strips password — defense-in-depth even if `select: false` is bypassed.
  - Virtual fields (`attendances`, `leaves`, `payrolls`, `performances`) enable reverse lookups without storing arrays.
  - Auto-populate `departmentId` on all `find` queries — the most common access pattern.
- **Indexes:**
  - `{ email: 1 }` — unique login lookups.
  - `{ departmentId: 1 }` — filter employees by department.
  - `{ status: 1 }` — filter active/inactive.
  - `{ departmentId: 1, status: 1 }` — compound: "active employees in department X".

#### Attendance (`Attendance.js`)
- **Purpose:** Tracks daily check-in/check-out for each employee.
- **Key decisions:**
  - `checkInTime` and `checkOutTime` are separate nullable fields rather than an array of pairs — simpler queries for "who is checked in now?".
  - `date` is stored separately (not extracted from `checkInTime`) — allows backfilling and explicit date-based queries.
  - Checkout validation ensures `checkOutTime > checkInTime`.
  - Auto-populates employee details on `find`.
- **Indexes:**
  - `{ employeeId: 1, date: 1 }` — unique compound: one attendance record per employee per day (application-level uniqueness enforced via `upsert` in service layer).
  - `{ date: 1 }` — daily attendance reports.
  - `{ employeeId: 1, status: 1 }` — "show all late arrivals for employee X".
  - `{ status: 1, date: 1 }` — "count all absent records today".

#### Payroll (`Payroll.js`)
- **Purpose:** Monthly salary records generated per employee.
- **Key decisions:**
  - `totalSalary` is auto-calculated in pre-save: `basicSalary + bonus - deduction`. This avoids application-level calculation errors.
  - All monetary fields use `Number` (double). For production payroll accuracy, consider `mongoose-int32` or storing cents as integers.
- **Indexes:**
  - `{ employeeId: 1, paymentDate: 1 }` — payroll history per employee sorted by date.
  - `{ status: 1 }` — filter pending/unpaid/paid.
  - `{ paymentDate: 1 }` — monthly payroll processing queries.
  - `{ employeeId: 1, status: 1 }` — "unpaid records for employee X".

#### Leave (`Leave.js`)
- **Purpose:** Employee leave requests with approval workflow.
- **Key decisions:**
  - `endDate >= startDate` validation prevents logical errors.
  - `status` allows exactly three states: `pending` → `approved` | `rejected`.
  - Auto-populates employee details on queries.
- **Indexes:**
  - `{ employeeId: 1, status: 1 }` — "pending leaves for employee X".
  - `{ status: 1 }` — global pending leaves for admin approval queue.
  - `{ leaveType: 1 }` — leave type distribution analytics.
  - `{ startDate: 1, endDate: 1 }` — date-range queries and calendar overlap checks.

#### Performance (`Performance.js`)
- **Purpose:** Periodic employee performance evaluations.
- **Key decisions:**
  - `rating` is an integer 1–5 with explicit validation.
  - `evaluationDate` defaults to `Date.now` — can be overridden to backdate.
  - Auto-populates employee details.
- **Indexes:**
  - `{ employeeId: 1, evaluationDate: 1 }` — evaluation history sorted by date.
  - `{ rating: 1 }` — filter by rating level.
  - `{ evaluationDate: 1 }` — recent evaluations queries.

#### Admin (`Admin.js`)
- **Purpose:** System administrators. Completely separate from Employee collection.
- **Key decisions:**
  - Same password hashing and `select: false` pattern as Employee.
  - `role` has two tiers: `super-admin` (full access) and `admin` (standard). This enables future RBAC expansion without schema changes.
  - Independent `toJSON()` for password removal.
- **Indexes:** `{ email: 1 }` — unique login lookups.

### 2.3 Schema Comparison Table

| Aspect | Department | Employee | Attendance | Payroll | Leave | Performance | Admin |
|--------|-----------|----------|------------|---------|-------|-------------|-------|
| **Document size** | ~200 B | ~500 B | ~300 B | ~400 B | ~350 B | ~300 B | ~250 B |
| **Write frequency** | Low | Low | Very High (daily) | Medium (monthly) | Medium | Low | Very Low |
| **Read frequency** | Low | High | High | Medium | Medium | Low | Low |
| **Avg records** | 10–50 | 100–10K | 36K–3.6M/yr | 1.2K–120K/yr | 1K–100K/yr | 200–20K/yr | 2–20 |
| **Growth pattern** | Stable | Linear | Linear (daily) | Linear (monthly) | Linear | Periodic | Stable |

---

## 3. Relationship Explanation

### 3.1 Core Relationship: Department → Employee

```
Department (1) ────────── has many ──────────► Employee (N)
                                                    │
              ◄────── belongs to ──────────────────┘
```

- **Implementation:** `Employee.departmentId` stores `Department._id`.
- **Why unidirectional?** Only the child (Employee) stores the reference. The parent (Department) uses Mongoose virtuals (`employees`, `employeeCount`) for reverse lookups. This avoids maintaining an array on Department that would need atomic `$push`/`$pull` on every employee create/delete/transfer.
- **Query pattern:** `Employee.find({ departmentId: deptId })` — uses `{ departmentId: 1 }` index.

### 3.2 Satellite Relationships: Employee → {Attendance, Payroll, Leave, Performance}

```
Employee (1) ── has many ──► Attendance (N)
Employee (1) ── has many ──► Payroll (N)
Employee (1) ── has many ──► Leave (N)
Employee (1) ── has many ──► Performance (N)
```

- **Implementation:** Each child document stores `employeeId` referencing `Employee._id`.
- **Why four separate collections?** Each child has fundamentally different fields, lifecycle, and access patterns:
  - **Attendance:** High-frequency writes (daily), time-series data, needs date-based aggregation.
  - **Payroll:** Monthly cadence, contains monetary calculations, immutable once `paid`.
  - **Leave:** State machine workflow (pending → approved/rejected), needs admin approval queries.
  - **Performance:** Periodic (quarterly/annual), contains subjective feedback text.
- **Why not embed?** If we embedded attendance in Employee, the document would grow by ~300B/day = ~110KB/year = ~1MB/10 years. For 10K employees, that's 10GB of embedded data that can't be independently indexed or queried.

### 3.3 Standalone: Admin

```
Admin — no relationships to other collections
```

- Admin is intentionally decoupled. System administrators are not "employees" — they don't clock in, receive payroll, or take leave. Storing them separately provides clear security boundaries. If a future requirement allows Employee to also be an Admin, a linking collection (`UserRoles`) should be introduced rather than merging schemas.

### 3.4 Relationship Mapping Table

| # | Parent | Child | FK Field on Child | Cardinality | Cascade Delete |
|---|--------|-------|-------------------|-------------|----------------|
| 1 | Department | Employee | `departmentId` | 1 : N | `SET NULL` — employees retain record without department |
| 2 | Employee | Attendance | `employeeId` | 1 : N | `CASCADE` — attendance useless without employee |
| 3 | Employee | Payroll | `employeeId` | 1 : N | `CASCADE` — payroll useless without employee |
| 4 | Employee | Leave | `employeeId` | 1 : N | `CASCADE` — leave useless without employee |
| 5 | Employee | Performance | `employeeId` | 1 : N | `CASCADE` — performance useless without employee |

> **Note on Cascade Delete:** Mongoose does not have native cascade delete middleware. This is implemented in the **service layer** (not in schemas) using `pre('findOneAndDelete')` or `pre('deleteOne')` hooks on Employee. Example logic in the service layer:
> ```js
> await Attendance.deleteMany({ employeeId });
> await Payroll.deleteMany({ employeeId });
> await Leave.deleteMany({ employeeId });
> await Performance.deleteMany({ employeeId });
> ```

---

## 4. Optimization Suggestions

### 4.1 Index Optimization

#### Current Indexes (10 compound + 12 single = 22 total)

Recommended index review process:

1. **Monitor slow queries:** Use `db.setProfilingLevel(1, { slowms: 100 })` or MongoDB Atlas Performance Advisor.
2. **Remove unused indexes:** Run `$indexStats` to identify indexes with zero usage — each index adds write overhead.
3. **Covering queries:** For the most frequent query pattern (`GET /attendance?employeeId=X&date=Y`), the compound index `{ employeeId: 1, date: 1 }` is a **covered query** — MongoDB can satisfy it entirely from the index without reading documents.

#### Index Memory Budget

On an M40 Atlas cluster (8 GB RAM):
- Maximum recommended index size: ~40% of RAM = ~3.2 GB
- Estimated index sizes:
  - Employee: ~32 MB (4 indexes × avg 300 B/doc × 10K docs)
  - Attendance: ~240 MB (4 indexes × avg 200 B/doc × 3.6M docs)
  - Others: ~10–50 MB each
- **Total estimated:** ~400 MB — well within budget.

### 4.2 Recommended Additional Indexes (for reporting)

If the application adds analytics features, consider these:

```javascript
// Monthly attendance aggregation
attendanceSchema.index({ date: 1, status: 1 });

// Department + salary range queries
employeeSchema.index({ departmentId: 1, salary: 1 });

// Leave date overlap detection
leaveSchema.index({ employeeId: 1, startDate: 1, endDate: 1 });
```

### 4.3 Aggregation Pipeline Optimization

#### Report: Monthly attendance summary per employee

```javascript
Attendance.aggregate([
  { $match: { date: { $gte: start, $lte: end } } },
  { $group: {
    _id: { employeeId: '$employeeId', status: '$status' },
    count: { $sum: 1 },
  }},
  { $sort: { '_id.status': 1 } },
]);
// Uses index: { date: 1 } for initial $match
```

#### Optimization tips for aggregations:

- **Match first:** Always place `$match` at the start of the pipeline to use indexes.
- **Project early:** Use `$project` or `$addFields` after `$match` to reduce document size flowing through the pipeline.
- **Allow disk use:** For large datasets, pass `{ allowDiskUse: true }` to aggregation.
- **Use `$sort + $limit`:** If you only need top N results, sort then limit to reduce working set.

### 4.4 Schema Design Optimizations

#### Attendance — High Write Volume

Attendance is the highest-write collection. Recommendations:

```javascript
// 1. Use lean queries for reads (no Mongoose overhead)
Attendance.find({ employeeId, date }).lean();

// 2. Use bulkWrite for payroll generation
const operations = employees.map(emp => ({
  updateOne: {
    filter: { employeeId: emp._id, paymentDate: { $exists: false } },
    update: { $set: { ... } },
    upsert: true,
  },
}));
await Payroll.bulkWrite(operations);

// 3. Use upsert for check-in (prevents duplicate records)
await Attendance.findOneAndUpdate(
  { employeeId, date },
  { $set: { checkInTime: now, status: 'present' } },
  { upsert: true, new: true }
);
```

#### Employee — Read-Heavy with Joins

```javascript
// 1. Disable auto-populate on heavy list queries
Employee.find({}).select('-departmentId'); // skip populate

// 2. Use projection to return only needed fields
Employee.find({}).select('fullName email departmentId');

// 3. Use pagination (never load all 10K employees at once)
Employee.find(filter)
  .skip((page - 1) * limit)
  .limit(limit)
  .sort({ createdAt: -1 });
```

### 4.5 Connection Pool & Driver Settings

```javascript
// Recommended connection options
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,        // Adjust based on concurrent users (10–50)
  minPoolSize: 2,         // Keep warm connections for burst
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,              // Force IPv4 — avoids IPv6 DNS resolution delays
});
```

### 4.6 Sharding Strategy (Future — >50M records)

If Attendance exceeds 50M documents:

```
Shard key: { employeeId: 1, date: 1 }
  - Provides good cardinality
  - Supports the primary query pattern (per-employee, date-range)
  - Avoids jumbo chunks due to compound key
```

### 4.7 Validation Performance Considerations

- **Pre-save hooks** add latency. Employee password hashing (~200ms) is unavoidable — do it once per employee.
- **Schema-level validators** (`min`, `max`, `enum`) are fast (in-memory checks).
- **Custom validators** (e.g., Attendance checkout > checkin) are lightweight.
- **Heavy validators** (e.g., checking department existence on every attendance write) should be moved to the service layer.

### 4.8 Data Archival

Attendance records older than 12 months can be:
1. **Moved to a cold collection:** `Attendance_2025` — partitioned by year.
2. **Aggregated into monthly summaries:** Store monthly counts in a new `AttendanceSummary` collection, then drop raw records.
3. **TTL index alternative:** Not recommended here — legal/compliance may require 1+ year retention.

### 4.9 Schema Change Management

MongoDB is schema-flexible, but Mongoose enforces a schema. For production changes:

```javascript
// Adding a new optional field (no downtime):
// 1. Add to Mongoose schema
emergencyContact: { type: String }

// 2. Backfill in batches
const cursor = Employee.find({ emergencyContact: { $exists: false } }).cursor();
for await (const doc of cursor) {
  doc.emergencyContact = null;
  await doc.save(); // or use bulkWrite
}

// 3. Add index after backfill (builds in background)
employeeSchema.index({ emergencyContact: 1 }, { background: true });
```

### 4.10 Atlas Search (Future)

If full-text search across employees becomes required:

```javascript
// Atlas Search index definition (in Atlas UI, not code)
{
  "mappings": {
    "fields": {
      "fullName": { "type": "string", "analyzer": "lucene.standard" },
      "position": { "type": "string" },
      "departmentName": { "type": "string" }  // from $lookup
    }
  }
}

// Mongoose query
Employee.aggregate([
  {
    $search: {
      compound: {
        should: [
          { autocomplete: { path: 'fullName', query: 'Joh' } },
          { text: { path: 'position', query: 'developer' } },
        ],
      },
    },
  },
  { $limit: 10 },
]);
```

---

## Appendix: Quick Reference

| File | Model | Key Index | Virtual Fields |
|------|-------|-----------|----------------|
| `Department.js` | Department | `departmentName: 1` (unique) | `employees`, `employeeCount` |
| `Employee.js` | Employee | `email: 1` (unique), `departmentId: 1, status: 1` | `attendances`, `leaves`, `payrolls`, `performances` |
| `Attendance.js` | Attendance | `employeeId: 1, date: 1` | — |
| `Payroll.js` | Payroll | `employeeId: 1, paymentDate: 1` | — |
| `Leave.js` | Leave | `employeeId: 1, status: 1` | — |
| `Performance.js` | Performance | `employeeId: 1, evaluationDate: 1` | — |
| `Admin.js` | Admin | `email: 1` (unique) | — |

---

*End of Database Schema Document*
