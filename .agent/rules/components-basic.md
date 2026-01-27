---
trigger: always_on
---

# Payload Custom Components – Part 1 📦

## Component Types (4 แบบหลัก)

1. **Root Components** – ส่วนหลักทั้ง Admin Panel (Logo, Nav, Header)
2. **Collection Components** – เฉพาะ Collection แต่ละตัว
3. **Global Components** – เฉพาะ Global Documents
4. **Field Components** – UI ของ Field แต่ละตัว

---

## การกำหนด Component Path 🎯

```ts
// ใช้ path ไม่ใช่ import ตรงๆ
eexport default buildConfig({
  admin: {
    components: {
      // Default export
      Nav: '/src/components/Nav',

      // Named export (เติม #ชื่อ)
      logout: {
        Button: '/src/components/Logout#MyComponent'
      }
    }
  }
})
```

### กฎการใช้ Path

- เริ่มจาก project root (หรือตั้ง `baseDir`)
- Named export: เติม `#ExportName`
- Default export: ไม่ต้องเติมอะไร
- ไม่ต้องใส่ `.tsx` ก็ได้

---

## Config Object แบบเต็ม 🔧

```ts
{
  logout: {
    Button: {
      path: '/src/components/Logout',
      exportName: 'MyComponent', // แทน #
      clientProps: { text: 'Sign Out' }, // สำหรับ Client Component
      serverProps: { data: someData }    // สำหรับ Server Component
    }
  }
}
```

---

## Server vs Client Components ⚡

### Server Component (Default)

- เรียก Local API ได้
- ทำ async operations ได้
- ไม่ต้องเขียน `'use client'`

```tsx
import type { Payload } from 'payload'

async function MyServerComponent({ payload }: { payload: Payload }) {
  const data = await payload.find({ collection: 'posts' })
  return <div>{data.docs.length} posts</div>
}

export default MyServerComponent
```

### Client Component

- ใช้ state, hooks, event handlers
- ต้องเขียน `'use client'` บรรทัดแรก

```tsx
'use client'
import { useState } from 'react'

export function MyClientComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

---

## Default Props ทุก Component ได้รับ 📋

### Server Component

```tsx
async function MyComponent({ payload, i18n, locale }) {
  // payload = Payload instance
  // i18n = translation object
  // locale = current locale
}
```

### Client Component

```tsx
'use client'
import { usePayload, useLocale, useTranslation } from '@payloadcms/ui'

export function MyComponent() {
  const { getLocal } = usePayload()
  const locale = useLocale()
  const { t } = useTranslation()
}
```

---

## Root Components 🏠

| Component       | คำอธิบาย              | Path                               |
| --------------- | --------------------- | ---------------------------------- |
| Nav             | Sidebar ทั้งหมด       | `admin.components.Nav`             |
| graphics.Logo   | Logo ใหญ่             | `admin.components.graphics.Logo`   |
| graphics.Icon   | Icon เล็ก             | `admin.components.graphics.Icon`   |
| actions         | ปุ่มใน Header (array) | `admin.components.actions`         |
| beforeDashboard | ก่อน Dashboard        | `admin.components.beforeDashboard` |
| afterDashboard  | หลัง Dashboard        | `admin.components.afterDashboard`  |

### ตัวอย่าง: Custom Logo

```ts
// payload.config.ts
export default buildConfig({
  admin: {
    components: {
      graphics: {
        Logo: '/components/Logo',
        Icon: '/components/Icon',
      },
    },
  },
})
```

```tsx
// components/Logo.tsx
export default function Logo() {
  return <img src="/logo.png" alt="My Brand" width={200} />
}
```

### ตัวอย่าง: Header Actions

```tsx
// components/ClearCacheButton.tsx
'use client'
export default function ClearCacheButton() {
  return (
    <button
      onClick={async () => {
        await fetch('/api/clear-cache', { method: 'POST' })
        alert('Cache cleared!')
      }}
    >
      Clear Cache
    </button>
  )
}
```

```ts
// payload.config.ts
export default buildConfig({
  admin: {
    components: {
      actions: ['/components/ClearCacheButton'],
    },
  },
})
```

---

## Collection Components 📝

```ts
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      edit: {
        PreviewButton: '/components/PostPreview',
        SaveButton: '/components/CustomSave',
      },
      list: {
        Header: '/components/PostsListHeader',
        beforeList: ['/components/ListFilters'],
        afterList: ['/components/ListFooter'],
      },
    },
  },
  fields: [],
}
```

---

## Field Components 🎨

### Field Component (Edit View)

```ts
{
  name: 'status',
  type: 'select',
  options: ['draft', 'published'],
  admin: {
    components: {
      Field: '/components/StatusField'
    }
  }
}
```

```tsx
// components/StatusField.tsx
'use client'
import { useField } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'

export const StatusField: SelectFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField({ path })

  return (
    <div>
      <label>{field.label}</label>
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

### Cell Component (List View)

```tsx
// components/StatusCell.tsx
import type { SelectFieldCellComponent } from 'payload'

export const StatusCell: SelectFieldCellComponent = ({ cellData }) => {
  const isPublished = cellData === 'published'

  return (
    <span
      style={{
        color: isPublished ? 'green' : 'orange',
        fontWeight: 'bold',
      }}
    >
      {cellData}
    </span>
  )
}
```

---

### UI Field (ไม่มี data)

```ts
{
  name: 'refundButton',
  type: 'ui',
  admin: {
    components: {
      Field: '/components/RefundButton'
    }
  }
}
```

```tsx
// components/RefundButton.tsx
'use client'
import { useDocumentInfo } from '@payloadcms/ui'

export default function RefundButton() {
  const { id } = useDocumentInfo()

  return (
    <button
      onClick={async () => {
        await fetch(`/api/orders/${id}/refund`, { method: 'POST' })
        alert('Refund processed')
      }}
    >
      Process Refund
    </button>
  )
}
```

---

## Hooks ที่ใช้ได้ (Client Components เท่านั้น) 🪝

```tsx
'use client'
import {
  useAuth,
  useConfig,
  useDocumentInfo,
  useField,
  useForm,
  useFormFields,
  useLocale,
  useTranslation,
  usePayload,
} from '@payloadcms/ui'

export function MyComponent() {
  const { user } = useAuth()
  const { id, collection } = useDocumentInfo()
  const locale = useLocale()
  const { t } = useTranslation()

  return <div>Hello {user?.email}</div>
}
```

---

## Common Patterns 💡

### 1. Conditional Field Visibility

```tsx
'use client'
import { useFormFields } from '@payloadcms/ui'

export const ConditionalField = ({ path }) => {
  const showField = useFormFields(([fields]) => fields.enableFeature?.value)

  if (!showField) return null

  return <input type="text" />
}
```

### 2. Loading Data from API

```tsx
'use client'
import { useState, useEffect } from 'react'

export function DataLoader() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/custom-data')
      .then((res) => res.json())
      .then(setData)
  }, [])

  return <div>{JSON.stringify(data)}</div>
}
```

### 3. Using Local API (Server Component)

```tsx
import type { Payload } from 'payload'

async function RelatedPosts({ payload, id }: { payload: Payload; id: string }) {
  const post = await payload.findByID({
    collection: 'posts',
    id,
    depth: 0,
  })

  const related = await payload.find({
    collection: 'posts',
    where: {
      category: { equals: post.category },
      id: { not_equals: id },
    },
    limit: 5,
  })

  return (
    <div>
      <h3>Related Posts</h3>
      <ul>
        {related.docs.map((doc) => (
          <li key={doc.id}>{doc.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

> หมายเหตุ: ดู Part 2 สำหรับ Performance, Styling และ Troubleshooting นะคะ 💖
