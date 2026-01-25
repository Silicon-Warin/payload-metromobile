# Promotions Manual (Payload → Frontend)

เอกสารนี้เป็นคู่มือสำหรับทีมคอนเทนต์/แอดมินในการสร้างและจัดการ **Promotion** ใน Payload CMS และทำให้หน้าเว็บฝั่ง `byd-metromobile` อัปเดตอัตโนมัติผ่าน **On-demand Revalidation** ค่ะ

## 1) ภาพรวมการทำงาน (Data flow)

1. แอดมินแก้ Promotion ใน Payload
2. ตอนกด Save:
   - ระบบจะ parse ข้อมูลจาก Quick Entry (Bulk Paste) ไปเป็น `benefits[]` + `conditions[]`
3. ตอน Publish/Unpublish/Delete:
   - Payload จะเรียก webhook ไปที่ Frontend: `POST /api/revalidate/promotion`
   - Frontend จะ `revalidateTag('promotions')` และ (ถ้ามี slug) `revalidateTag('promotion:${slug}')`

## 2) สร้าง Promotion ใหม่ (วิธีที่แนะนำ)

ไปที่ `Promotions` → `Create New`

### 2.1 ฟิลด์หลักที่ควรใส่

- **title**: ชื่อแคมเปญ/โปรโมชั่น
- **campaignStatus**: `active | upcoming | expired`
- **priority**: ตัวเลขน้อย = แสดงก่อน
- **startDate / endDate**: วันที่เริ่ม–สิ้นสุด (ถ้ามี)
- **modelSlug**: ใส่ slug ของรุ่นรถให้ตรงกับหน้า `/models/<slug>` (เช่น `sealion7`) ถ้าเป็นโปรเฉพาะรุ่น
- **heroMedia**: รูปหลัก
- **gallery**: อัลบั้มรูปเพิ่มเติม

## 3) Quick Entry (Bulk Paste from Rever)

ส่วนนี้อยู่ใน collapsible ชื่อ **“Quick Entry (Bulk Paste from Rever)”**

### 3.1 `benefitsHtml` (แนะนำที่สุด)

ใช้เมื่อ Rever มีตารางสิทธิประโยชน์ (table) และ/หรือมีเงื่อนไขเป็นข้อ 3.x / 4.x

**วิธีเอา HTML จาก Rever:**
1. เปิดหน้า Rever ที่มีตารางสิทธิประโยชน์
2. คลิกขวา → Inspect
3. เลือก element `<table>` ของสิทธิประโยชน์
4. Copy → **Copy outerHTML**
5. วางลงช่อง `benefitsHtml`
6. กด Save

**ผลลัพธ์:**
- ระบบจะพยายาม parse:
  - Benefits จากแถวในตาราง (`<tr><td>...</td><td>...</td></tr>`)
  - Conditions จาก `<p>` ที่ขึ้นต้นด้วย `3.x` หรือ `4.x`
- แล้วเติมลง `benefits[]` และ `conditions[]` ให้เอง
- จากนั้น `benefitsHtml / benefitsBulk / conditionsBulk` จะถูก “ล้าง” อัตโนมัติหลัง Save (ตั้งใจให้เป็นช่อง paste ชั่วคราว)

### 3.2 `benefitsBulk` (ข้อความธรรมดา)

ใช้เมื่อไม่มี HTML table หรืออยากใส่เร็วๆ แบบ 1 บรรทัด = 1 ข้อ

ตัวอย่าง:

```
ฟรีประกันภัยชั้น 1 นาน 1 ปี
ดอกเบี้ย 1.88%
ชุดฟิล์มเซรามิก
```

ระบบจะ:
- ตัด bullet/ตัวเลขนำหน้าให้
- เดา `type` จาก keyword ภาษาไทย (เช่น “ดอกเบี้ย”, “ประกันภัย”, “รับประกันแบตเตอรี่”)
- พยายามดึง `value` (เช่น % หรือ ราคา “บาท”)

### 3.3 `conditionsBulk` (ข้อความธรรมดา)

ใช้เมื่ออยากใส่เงื่อนไขแบบ 1 บรรทัด = 1 ข้อ

ตัวอย่าง:

```
เฉพาะลูกค้าที่จองและรับรถภายในวันที่กำหนด
เงื่อนไขเป็นไปตามที่บริษัทกำหนด
```

## 4) ตรวจและปรับ “Structured Fields”

หลัง Save แล้ว ให้เลื่อนลงไปดู:

### 4.1 `benefits[]`

- แต่ละ item มี:
  - **type**: ประเภทสิทธิประโยชน์ (เช่น `financing`, `insurance_1y`)
  - **title** (optional): หัวข้อสั้น
  - **description**: รายละเอียดเต็ม (ต้องมี)
  - **value** (optional): ค่าที่ดึงได้ เช่น `1.88%`, `699900`
  - **sort**: ลำดับการแสดง (น้อยก่อน)

### 4.2 `conditions[]`

- แต่ละ item มี:
  - **text**: ข้อความเงื่อนไข (ต้องมี)
  - **sort**: ลำดับ

## 5) Publish / Unpublish / Delete (ให้เว็บอัปเดต)

### 5.1 Publish

1. เปิด Promotion ที่ต้องการ
2. เปลี่ยน status เป็น **Published**
3. กด Save/Publish

Payload จะยิง webhook ไป Frontend เพื่อ revalidate ทันที

### 5.2 Unpublish

1. เปลี่ยนจาก Published → Draft
2. Save

Payload จะยิง webhook ให้ revalidate เช่นกัน (ใช้ slug เดิม)

### 5.3 Delete

ลบแล้ว Payload จะยิง webhook ให้ revalidate (ถ้ามี slug)

## 6) วิธีเช็คว่า Revalidation ทำงานจริง

### 6.1 เช็คจาก Payload logs

เวลา publish จะมี log ประมาณนี้:
- `Revalidating promotion: <slug>`
- `Successfully revalidated promotion: <slug>` (ถ้า 200)

### 6.2 ยิงเองด้วย curl (ตรวจเร็ว)

แทนค่า `YOUR_SECRET` ให้ตรงกับ `PAYLOAD_REVALIDATE_SECRET`

```bash
curl -X POST https://bydmetromobile.com/api/revalidate/promotion ^
  -H "x-revalidate-secret: YOUR_SECRET" ^
  -H "Content-Type: application/json" ^
  -d "{\"slug\":\"your-promo-slug\"}"
```

## 7) Troubleshooting

### 7.1 Save แล้ว benefits/conditions ไม่ขึ้น

เช็คก่อนว่า:
- Paste ถูกช่องไหม (`benefitsHtml` / `benefitsBulk` / `conditionsBulk`)
- ข้อมูลมีความยาวพอ (ระบบกรองบรรทัดสั้นๆ < 10 chars)
- ถ้าเป็น HTML: ให้แน่ใจว่า “copy outerHTML ของ `<table>`” จริง

### 7.2 Publish แล้วเว็บไม่อัปเดต

เช็ค:
- `FRONTEND_URL` ใน payload env ถูกต้อง (ไม่มี trailing slash)
- `PAYLOAD_REVALIDATE_SECRET` ฝั่ง Payload และ Frontend ตรงกัน
- Frontend endpoint `/api/revalidate/promotion` ตอบ 200 หรือไม่

### 7.3 Video embed ใน content แสดงไม่ได้

ถ้าใช้ block `EmbedVideo` แล้วโดน CSP block:
- ต้อง whitelist `frame-src` ใน `byd-metromobile/next.config.*` ให้ครอบคลุมโดเมนที่ embed (เช่น YouTube/Vimeo/Facebook)

## 8) สำหรับ Dev: Seed Header/Footer (ถ้าหัวเว็บไม่ขึ้น)

ถ้าหน้าเว็บ header/footer ว่าง ให้ seed globals:

```bash
pnpm seed:globals
```

หมายเหตุ: seed จะ update global `header` และ `footer` ใน Payload CMS

