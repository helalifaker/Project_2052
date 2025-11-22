# Project Zeta - Stack Documentation Reference

This file contains up-to-date documentation for all libraries and frameworks used in Project Zeta. This documentation is fetched from Context7 MCP and should be consulted when:

- Implementing new features using these libraries
- Debugging issues with library-specific functionality
- Understanding best practices and patterns
- Migrating or upgrading library versions
- Reviewing code that uses these libraries

**Last Updated:** Generated via Context7 MCP

---

## Table of Contents

1. [Next.js 16](#nextjs-16)
2. [Prisma 7](#prisma-7)
3. [Supabase](#supabase)
4. [React 19](#react-19)
5. [Zod 4](#zod-4)
6. [Zustand 5](#zustand-5)
7. [TanStack React Table 8](#tanstack-react-table-8)
8. [Recharts 3](#recharts-3)

---

## Next.js 16

### App Router & Server Components

**Default Server Component with Data Fetching:**

```typescript
// app/page.tsx
import HomePage from './home-page'

async function getPosts() {
  const res = await fetch('https://...')
  const posts = await res.json()
  return posts
}

export default async function Page() {
  // Fetch data directly in a Server Component
  const recentPosts = await getPosts()
  // Forward fetched data to your Client Component
  return <HomePage recentPosts={recentPosts} />
}
```

**Dynamic Data Fetching (no-store):**

```typescript
// Similar to getServerSideProps
async function getProjects() {
  const res = await fetch(`https://...`, { cache: 'no-store' })
  const projects = await res.json()
  return projects
}

export default async function Dashboard() {
  const projects = await getProjects()
  return (
    <ul>
      {projects.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  )
}
```

**Caching Strategies:**

```typescript
export default async function Page() {
  // Static data (force-cache is default)
  const staticData = await fetch(`https://...`, { cache: 'force-cache' })

  // Dynamic data (re-fetch on every request)
  const dynamicData = await fetch(`https://...`, { cache: 'no-store' })

  // Time-based revalidation (10 seconds)
  const revalidatedData = await fetch(`https://...`, {
    next: { revalidate: 10 },
  })

  return <div>...</div>
}
```

**Async Server Component with Params:**

```typescript
import LikeButton from '@/app/ui/like-button'
import { getPost } from '@/lib/data'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)

  return (
    <div>
      <main>
        <h1>{post.title}</h1>
        <LikeButton likes={post.likes} />
      </main>
    </div>
  )
}
```

### Key Patterns

- **Server Components by default** - Only use `'use client'` when needed
- **Data fetching in Server Components** - Use `async` functions directly
- **Caching control** - Use `cache` and `revalidate` options strategically
- **API Routes** - Use Route Handlers in `app/api/` directory

---

## Prisma 7

### Schema & Migrations

**Create and Apply Migrations:**

```bash
npx prisma migrate dev --name your_migration_name
```

**Schema Example:**

```prisma
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User?   @relation(fields: [authorId], references: [id])
  authorId  Int?
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}
```

### Client Queries

**Query with Relations:**

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    coinflips: {
      orderBy: { position: 'asc' },
    },
  },
})
```

**Select Only Needed Fields:**

```typescript
const proposals = await prisma.leaseProposal.findMany({
  select: { id: true, name: true, rentModel: true },
  where: { createdBy: userId }
})
```

**Transactions:**

```typescript
await prisma.$transaction(async (tx) => {
  const proposal = await tx.leaseProposal.create({ data: proposalData })
  await tx.auditLog.create({ data: logData })
})
```

**Multi-Schema Queries:**

```typescript
const orders = await prisma.order.findMany({
  where: {
    user: {
      id: 42,
    },
  },
})
```

### Prisma.Decimal ↔ Decimal.js Conversion

```typescript
import { Prisma } from '@prisma/client'
import Decimal from 'decimal.js'

// Save
await db.systemConfig.update({
  data: { zakatRate: new Prisma.Decimal(zakatRate.toString()) }
})

// Read
const config = await db.systemConfig.findUnique({ where: { id } })
const zakatRate = new Decimal(config.zakatRate.toString())
```

### Best Practices

- Use UUID for IDs (never Int)
- Use enums for fixed values
- Add indexes on foreign keys
- Include createdAt/updatedAt timestamps
- Use transactions for multi-table operations
- Select only needed fields

---

## Supabase

### Client Initialization

**Basic Client Setup:**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xyzcompany.supabase.co',
  'publishable-or-anon-key'
)
```

**Server-Side Client with Custom Storage:**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', {
  auth: {
    storage: {
      getItem: () => Promise.resolve('FETCHED_COOKIE'),
      setItem: () => {},
      removeItem: () => {},
    },
  },
})
```

**Admin Client (Server-Side):**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabase_url, service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const adminAuthClient = supabase.auth.admin
```

### Authentication

**Refresh Session:**

```typescript
const { data, error } = await supabase.auth.refreshSession()
const { session, user } = data
```

**Web3 Sign-In:**

```typescript
// Ethereum
const { data, error } = await supabase.auth.signInWithWeb3({
  chain: 'ethereum',
  statement: 'I accept the Terms of Service at https://example.com/tos'
})

// Solana
const { data, error } = await supabase.auth.signInWithWeb3({
  chain: 'solana',
  statement: 'I accept the Terms of Service at https://example.com/tos'
})
```

### Realtime

**Subscribe to Database Changes:**

```typescript
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {})

// Set custom JWT for Realtime
supabase.realtime.setAuth('your-custom-jwt')

const channel = supabase
  .channel('db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: 'body=eq.bye',
    },
    (payload) => console.log(payload)
  )
  .subscribe()
```

**Unsubscribe:**

```typescript
supabase.removeChannel(myChannel)
```

### Installation

```bash
npm install @supabase/supabase-js
```

---

## React 19

### Hooks

**useState:**

```typescript
import { useState } from 'react'

function SearchableVideoList({ videos }) {
  const [searchText, setSearchText] = useState('')
  const foundVideos = filterVideos(videos, searchText)
  return (
    <>
      <SearchInput
        value={searchText}
        onChange={newText => setSearchText(newText)} />
      <VideoList videos={foundVideos} />
    </>
  )
}
```

**useReducer:**

```typescript
import { useReducer } from 'react'

function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks)

  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text,
    })
  }

  function handleChangeTask(task) {
    dispatch({
      type: 'changed',
      task: task
    })
  }

  function handleDeleteTask(taskId) {
    dispatch({
      type: 'deleted',
      id: taskId
    })
  }

  return (
    <>
      <h1>Prague itinerary</h1>
      <AddTask onAddTask={handleAddTask} />
      <TaskList
        tasks={tasks}
        onChangeTask={handleChangeTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  )
}
```

**useActionState (Server Functions):**

```typescript
"use client"

import { updateName } from './actions'

function UpdateName() {
  const [state, submitAction, isPending] = useActionState(updateName, { error: null })

  return (
    <form action={submitAction}>
      <input type="text" name="name" disabled={isPending} />
      {state.error && <span>Failed: {state.error}</span>}
    </form>
  )
}
```

### Custom Hooks

**Extracting Logic:**

```typescript
import { useState } from 'react'
import { useChatRoom } from './useChatRoom.js'

export default function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234')

  useChatRoom({
    roomId: roomId,
    serverUrl: serverUrl
  })

  return (
    <>
      <label>
        Server URL:
        <input value={serverUrl} onChange={e => setServerUrl(e.target.value)} />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  )
}
```

### Best Practices

- Use Server Components by default
- Extract reusable logic into custom hooks
- Use `useReducer` for complex state
- Use `useActionState` for Server Functions
- Memoize expensive computations with `useMemo` and `useCallback`

---

## Zod 4

### Basic Schema Definition

```typescript
import { z } from "zod"

const userSchema = z.object({
  username: z.string(),
  id: z.number()
})

type User = z.infer<typeof userSchema>
```

### Validation

**Parse (throws on error):**

```typescript
try {
  const user = userSchema.parse(validData)
  console.log("Parsed user:", user)
} catch (error) {
  console.error("Validation error:", error)
}
```

**safeParse (returns result):**

```typescript
const result = userSchema.safeParse(invalidData)

if (result.success) {
  console.log("Parsed user:", result.data)
} else {
  console.error("Validation error:", result.error.errors)
}
```

### Advanced Schemas

**With Validation Rules:**

```typescript
const UserSchema = z.object({
  name: z.string().min(1, { message: "Name must be at least 1 character long" }),
  email: z.string().email({ message: "Invalid email address" }),
  age: z.number().positive({ message: "Age must be a positive number" }).optional(),
})

type User = z.infer<typeof UserSchema>
```

**String Validation:**

```typescript
const stringSchema = z.string()
const result = stringSchema.parse("hello") // => "hello"
```

### Best Practices

- Always validate API inputs with Zod
- Use `safeParse` for error handling
- Infer TypeScript types from schemas
- Provide meaningful error messages
- Use `.optional()`, `.nullable()`, `.default()` for flexibility

---

## Zustand 5

### Basic Store

```typescript
import { create } from 'zustand'

const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

export default function CounterTabs() {
  const counterState = useCounterStore()
  return (
    <button onClick={() => counterState.increment()}>
      Count: {counterState.count}
    </button>
  )
}
```

### Persistence Middleware

```typescript
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }
type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}
type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    { name: 'position-storage' },
  ),
)
```

### Using Vanilla Stores in React

```typescript
import { useStore } from 'zustand'

const someState = useStore(store, selectorFn)
```

### Custom Storage (URL + LocalStorage)

```typescript
import { create } from 'zustand'
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware'

const persistentStorage: StateStorage = {
  getItem: (key): string => {
    if (getUrlSearch()) {
      const searchParams = new URLSearchParams(getUrlSearch())
      const storedValue = searchParams.get(key)
      return JSON.parse(storedValue as string)
    } else {
      return JSON.parse(localStorage.getItem(key) as string)
    }
  },
  setItem: (key, newValue): void => {
    if (getUrlSearch()) {
      const searchParams = new URLSearchParams(getUrlSearch())
      searchParams.set(key, JSON.stringify(newValue))
      window.history.replaceState(null, '', `?${searchParams.toString()}`)
    }
    localStorage.setItem(key, JSON.stringify(newValue))
  },
  removeItem: (key): void => {
    const searchParams = new URLSearchParams(getUrlSearch())
    searchParams.delete(key)
    window.location.search = searchParams.toString()
  },
}
```

### Best Practices

- Keep stores focused and small
- Use TypeScript for type safety
- Use persistence middleware for client-side state
- Use selectors to prevent unnecessary re-renders
- Combine stores when needed using factory patterns

---

## TanStack React Table 8

### Basic Table Setup

```typescript
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'

function MyTable({
  data,
  columns,
}: {
  data: Person[]
  columns: ColumnDef<Person>[]
}) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  })

  return (
    <div className="p-2">
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} colSpan={header.colSpan}>
                  <div
                    className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### Column Filtering

```typescript
function Filter({
  column,
  table,
}: {
  column: Column<any, any>
  table: Table<any>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={e =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={e =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <input
      className="w-36 border shadow rounded"
      onChange={e => column.setFilterValue(e.target.value)}
      onClick={e => e.stopPropagation()}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
  )
}
```

### Pagination Controls

```typescript
<div className="flex items-center gap-2">
  <button
    className="border rounded p-1"
    onClick={() => table.firstPage()}
    disabled={!table.getCanPreviousPage()}
  >
    {'<<'}
  </button>
  <button
    className="border rounded p-1"
    onClick={() => table.previousPage()}
    disabled={!table.getCanPreviousPage()}
  >
    {'<'}
  </button>
  <button
    className="border rounded p-1"
    onClick={() => table.nextPage()}
    disabled={!table.getCanNextPage()}
  >
    {'>'}
  </button>
  <button
    className="border rounded p-1"
    onClick={() => table.lastPage()}
    disabled={!table.getCanNextPage()}
  >
    {'>>'}
  </button>
  <span className="flex items-center gap-1">
    <div>Page</div>
    <strong>
      {table.getState().pagination.pageIndex + 1} of{' '}
      {table.getPageCount().toLocaleString()}
    </strong>
  </span>
  <select
    value={table.getState().pagination.pageSize}
    onChange={e => {
      table.setPageSize(Number(e.target.value))
    }}
  >
    {[10, 20, 30, 40, 50].map(pageSize => (
      <option key={pageSize} value={pageSize}>
        Show {pageSize}
      </option>
    ))}
  </select>
</div>
```

### Best Practices

- Use `getCoreRowModel()` for basic functionality
- Add `getSortedRowModel()` for sorting
- Add `getFilteredRowModel()` for filtering
- Add `getPaginationRowModel()` for pagination
- Use `flexRender` for rendering cells and headers
- Memoize columns and data arrays

---

## Recharts 3

### Basic Line Chart

```typescript
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { name: 'Jan', sales: 4000, expenses: 2400, profit: 1600 },
  { name: 'Feb', sales: 3000, expenses: 1398, profit: 1602 },
  { name: 'Mar', sales: 2000, expenses: 9800, profit: -7800 },
]

function LineChartExample() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#82ca9d"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#ff7300"
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Bar Chart with Custom Colors

```typescript
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
]

const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

function StackedBarChartExample() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="pv" stackId="a" fill="#8884d8" />
        <Bar dataKey="uv" stackId="a" fill="#82ca9d" />
        <Bar dataKey="amt" fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
```

### Responsive Container

```typescript
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

function ResponsiveExample() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Percentage-based sizing */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="uv" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      {/* Aspect ratio constraint */}
      <ResponsiveContainer width="100%" aspect={2}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Custom Tooltip

```typescript
function CustomTooltip({ payload, label, active }) {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
        <p className="intro">{getIntroOfPage(label)}</p>
        <p className="desc">Anything you want can be displayed here.</p>
      </div>
    )
  }
  return null
}

<LineChart data={data}>
  <Tooltip content={<CustomTooltip />} />
  <Line type="monotone" dataKey="uv" stroke="#8884d8" />
</LineChart>
```

### Best Practices

- Always use `ResponsiveContainer` for responsive charts
- Use `CartesianGrid` for better readability
- Customize `Tooltip` and `Legend` for better UX
- Use `Cell` component for individual bar coloring
- Set appropriate margins for labels
- Use `aspect` prop for consistent sizing

---

## Additional Resources

### When to Consult This Documentation

1. **Implementing New Features**
   - Check library-specific patterns and best practices
   - Review code examples for similar use cases
   - Understand API signatures and options

2. **Debugging Issues**
   - Verify correct usage of library APIs
   - Check for common pitfalls and solutions
   - Review error handling patterns

3. **Code Reviews**
   - Ensure code follows library best practices
   - Verify correct implementation patterns
   - Check for performance optimizations

4. **Upgrading Libraries**
   - Review migration guides and breaking changes
   - Check new features and improvements
   - Verify compatibility with current codebase

### Updating This Documentation

This documentation is generated from Context7 MCP. To update:

1. Use Context7 MCP to fetch latest documentation
2. Update relevant sections with new patterns
3. Add new libraries as they are introduced
4. Remove deprecated patterns and libraries

### Related Documentation

- `CODING_STANDARDS.md` - Complete coding standards and patterns
- `03_TSD_COMPREHENSIVE.md` - Technical architecture decisions
- `AGENT_IMPLEMENTATION_GUIDE.md` - Agent orchestration system

---

**Note:** This documentation focuses on practical usage patterns. For complete API references, consult the official documentation of each library.

