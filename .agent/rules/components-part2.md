---
trigger: always_on
---

# Payload Custom Components – Part 2 ⚡

## Performance Best Practices 🚀

### 1. Minimize Client Bundle Size

```tsx
// ❌ BAD: Import ทั้ง package
'use client'
import { Button } from '@payloadcms/ui'

// ✅ GOOD: Import เฉพาะที่ใช้
import { Button } from '@payloadcms/ui/elements/Button'
```

**กฎ:**

- Admin Panel: import จาก `@payloadcms/ui`
- Frontend: ใช้ specific paths

---

### 2. Optimize Re-renders

```tsx
// ❌ BAD: Re-render ทุกครั้งที่ form เปลี่ยน
'use client'
import { useForm } from '@payloadcms/ui'

export function MyComponent() {
  const { fields } = useForm()
}

// ✅ GOOD: Re-render เฉพาะ field ที่ต้องการ
;('use client')
import { useFormFields } from '@payloadcms/ui'

export function MyComponent({ path }) {
  const value = useFormFields(([fields]) => fields[path])
}
```

---

### 3. Use Server Components เมื่อเป็นไปได้

```tsx
// ✅ GOOD: ไม่ส่ง JavaScript ไป client
async function PostCount({ payload }) {
  const { totalDocs } = await payload.find({
    collection: 'posts',
    limit: 0,
  })

  return <p>{totalDocs} posts</p>
}
```

ใช้ Client Component เฉพาะเมื่อจำเป็น:

- State (`useState`, `useReducer`)
- Effects (`useEffect`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)

---

### 4. React Best Practices

- ใช้ `React.memo()` สำหรับ expensive components
- ใส่ `key` prop ให้ถูกต้อง
- หลีกเลี่ยง inline function definitions
- ใช้ `Suspense` boundaries

---

## Styling Components 🎨

### Using CSS Variables

```tsx
import './styles.scss'

export function MyComponent() {
  return <div className="my-component">Custom Component</div>
}
```

```scss
.my-component {
  background-color: var(--theme-elevation-500);
  color: var(--theme-text);
  padding: var(--base);
  border-radius: var(--border-radius-m);
}
```

---

### Importing Payload SCSS

```scss
@import '~@payloadcms/ui/scss';

.my-component {
  @include mid-break {
    background-color: var(--theme-elevation-900);
  }
}
```

---

## Accessing Config 🔧

### Server Component

```tsx
async function MyServerComponent({ payload }) {
  const { config } = payload
  return <div>{config.serverURL}</div>
}
```

### Client Component

```tsx
'use client'
import { useConfig } from '@payloadcms/ui'

export function MyClientComponent() {
  const { config } = useConfig()
  return <div>{config.serverURL}</div>
}
```

> **หมายเหตุ:** Client config จะถูก strip functions และ validation ออก

---

## Field Config Access 📄

### Server Component

```tsx
import type { TextFieldServerComponent } from 'payload'

export const MyFieldComponent: TextFieldServerComponent = ({ field }) => {
  return <div>Field name: {field.name}</div>
}
```

### Client Component

```tsx
'use client'
import type { TextFieldClientComponent } from 'payload'

export const MyFieldComponent: TextFieldClientComponent = ({ clientField }) => {
  return <div>Field name: {clientField.name}</div>
}
```

---

## Translations (i18n) 🌍

### Server Component

```tsx
import { getTranslation } from '@payloadcms/translations'

async function MyServerComponent({ i18n }) {
  const title = getTranslation(myTranslation, i18n)
  return <p>{title}</p>
}
```

### Client Component

```tsx
'use client'
import { useTranslation } from '@payloadcms/ui'

export function MyClientComponent() {
  const { t, i18n } = useTranslation()

  return (
    <div>
      <p>{t('namespace:key', { variable: 'value' })}</p>
      <p>Language: {i18n.language}</p>
    </div>
  )
}
```

---

## Import Map 📦

Payload จะสร้าง import map ที่:

```
app/(payload)/admin/importMap.js
```

### Regenerate manually

```bash
payload generate:importmap
```

### Override location

```ts
export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
      importMapFile: path.resolve(dirname, 'app', 'custom-import-map.js'),
    },
  },
})
```

---

## Type Safety 🛡️

```tsx
import type {
  TextFieldServerComponent,
  TextFieldClientComponent,
  TextFieldCellComponent,
} from 'payload'

export const MyFieldComponent: TextFieldServerComponent = (props) => {
  // Props typed
}
```

---

## Troubleshooting 🔍

### `useConfig is undefined` หรือ hook errors

**สาเหตุ:** Version mismatch ระหว่าง Payload packages

```json
{
  "dependencies": {
    "payload": "3.0.0",
    "@payloadcms/ui": "3.0.0",
    "@payloadcms/richtext-lexical": "3.0.0"
  }
}
```

> ต้อง pin version ให้ตรงกันทุกตัว

---

### Component ไม่โหลด

Checklist:

1. Path ถูกไหม (relative to baseDir)
2. Named export ใส่ `#ExportName` ครบไหม
3. รัน `payload generate:importmap`
4. เช็ค TypeScript errors

---

### Component ไม่แสดง

```ts
// ❌ ผิด
components: {
  Nav: './src/components/Nav'
}

// ✅ ถูก
components: {
  Nav: '/src/components/Nav'
}
```

---

## Setting Base Directory 📁

```ts
import path from 'path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
    },
    components: {
      Nav: '/components/Nav',
    },
  },
})
```

---

## Custom Props 🎁

```ts
{
  logout: {
    Button: {
      path: '/components/Logout',
      clientProps: {
        buttonText: 'Sign Out',
        onLogout: () => console.log('Logged out')
      }
    }
  }
}
```

```tsx
'use client'
export function Logout({ buttonText, onLogout }) {
  return <button onClick={onLogout}>{buttonText}</button>
}
```

---

## Quick Reference 📚

### ใช้ Client Component เมื่อ

- ต้องการ state / effects
- ต้องการ event handlers
- ต้องใช้ browser APIs
- ต้องใช้ Payload hooks (`useAuth`, `useField`)

### ใช้ Server Component เมื่อ

- ดึงข้อมูลจาก database
- เรียก Local API
- แสดงผล static
- ไม่ต้อง interactivity

---

## Resources 🔗

- Official Docs: [https://payloadcms.com/docs/custom-components/overview](https://payloadcms.com/docs/custom-components/overview)
- Root Components: [https://payloadcms.com/docs/custom-components/root-components](https://payloadcms.com/docs/custom-components/root-components)
- Custom Views: [https://payloadcms.com/docs/custom-components/custom-views](https://payloadcms.com/docs/custom-components/custom-views)
- React Hooks: [https://payloadcms.com/docs/admin/react-hooks](https://payloadcms.com/docs/admin/react-hooks)
- Custom CSS: [https://payloadcms.com/docs/admin/customizing-css](https://payloadcms.com/docs/admin/customizing-css)

---
