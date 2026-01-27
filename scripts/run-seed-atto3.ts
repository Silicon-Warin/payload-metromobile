import { getPayload } from 'payload'
import config from '../src/payload.config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function seed() {
  console.log('Starting promotion seed from JSON...')

  const payload = await getPayload({ config })

  const jsonPath = path.resolve(__dirname, 'seed-new-promotion-atto3.json')
  const promotionData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  // Link any media if found
  const media = await payload.find({
    collection: 'media',
    limit: 1,
  })
  const mediaId = media.docs[0]?.id

  // Create or Update
  const existing = await payload.find({
    collection: 'promotions',
    where: {
      slug: { equals: promotionData.slug },
    },
  })

  const dataToSave = {
    ...promotionData,
    heroMedia: mediaId,
    gallery: mediaId ? [{ image: mediaId }] : [],
  }

  if (existing.totalDocs > 0) {
    console.log('Updating existing promotion...')
    await payload.update({
      collection: 'promotions',
      id: existing.docs[0].id,
      data: dataToSave,
    })
    console.log(`Updated promotion: ${existing.docs[0].title}`)
  } else {
    console.log('Creating new promotion...')
    await payload.create({
      collection: 'promotions',
      data: dataToSave,
    })
    console.log(`Created new promotion: ${promotionData.title}`)
  }

  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
