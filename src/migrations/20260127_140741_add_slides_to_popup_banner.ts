import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Create popup_banner_slides table if it doesn't exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "popup_banner_slides" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "description" varchar,
      "media_id" integer,
      "cta_label" varchar,
      "cta_href" varchar,
      "cta_new_tab" boolean DEFAULT false
    );
  `)

  // Create version table for drafts if it doesn't exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_popup_banner_v_version_slides" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "description" varchar,
      "media_id" integer,
      "cta_label" varchar,
      "cta_href" varchar,
      "cta_new_tab" boolean DEFAULT false,
      "_uuid" varchar
    );
  `)

  // Add foreign key constraints if they don't exist
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'popup_banner_slides_media_id_media_id_fk'
      ) THEN
        ALTER TABLE "popup_banner_slides" 
        ADD CONSTRAINT "popup_banner_slides_media_id_media_id_fk" 
        FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") 
        ON DELETE set null ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'popup_banner_slides_parent_id_fk'
      ) THEN
        ALTER TABLE "popup_banner_slides" 
        ADD CONSTRAINT "popup_banner_slides_parent_id_fk" 
        FOREIGN KEY ("_parent_id") REFERENCES "public"."popup_banner"("id") 
        ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = '_popup_banner_v_version_slides_media_id_media_id_fk'
      ) THEN
        ALTER TABLE "_popup_banner_v_version_slides" 
        ADD CONSTRAINT "_popup_banner_v_version_slides_media_id_media_id_fk" 
        FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") 
        ON DELETE set null ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = '_popup_banner_v_version_slides_parent_id_fk'
      ) THEN
        ALTER TABLE "_popup_banner_v_version_slides" 
        ADD CONSTRAINT "_popup_banner_v_version_slides_parent_id_fk" 
        FOREIGN KEY ("_parent_id") REFERENCES "public"."_popup_banner_v"("id") 
        ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
  `)

  // Create indexes if they don't exist
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "popup_banner_slides_order_idx" 
    ON "popup_banner_slides" USING btree ("_order");
    
    CREATE INDEX IF NOT EXISTS "popup_banner_slides_parent_id_idx" 
    ON "popup_banner_slides" USING btree ("_parent_id");
    
    CREATE INDEX IF NOT EXISTS "popup_banner_slides_media_idx" 
    ON "popup_banner_slides" USING btree ("media_id");
    
    CREATE INDEX IF NOT EXISTS "_popup_banner_v_version_slides_order_idx" 
    ON "_popup_banner_v_version_slides" USING btree ("_order");
    
    CREATE INDEX IF NOT EXISTS "_popup_banner_v_version_slides_parent_id_idx" 
    ON "_popup_banner_v_version_slides" USING btree ("_parent_id");
    
    CREATE INDEX IF NOT EXISTS "_popup_banner_v_version_slides_media_idx" 
    ON "_popup_banner_v_version_slides" USING btree ("media_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Drop indexes
  await db.execute(sql`
    DROP INDEX IF EXISTS "popup_banner_slides_order_idx";
    DROP INDEX IF EXISTS "popup_banner_slides_parent_id_idx";
    DROP INDEX IF EXISTS "popup_banner_slides_media_idx";
    DROP INDEX IF EXISTS "_popup_banner_v_version_slides_order_idx";
    DROP INDEX IF EXISTS "_popup_banner_v_version_slides_parent_id_idx";
    DROP INDEX IF EXISTS "_popup_banner_v_version_slides_media_idx";
  `)

  // Drop constraints
  await db.execute(sql`
    ALTER TABLE "popup_banner_slides" 
    DROP CONSTRAINT IF EXISTS "popup_banner_slides_media_id_media_id_fk";
    
    ALTER TABLE "popup_banner_slides" 
    DROP CONSTRAINT IF EXISTS "popup_banner_slides_parent_id_fk";
    
    ALTER TABLE "_popup_banner_v_version_slides" 
    DROP CONSTRAINT IF EXISTS "_popup_banner_v_version_slides_media_id_media_id_fk";
    
    ALTER TABLE "_popup_banner_v_version_slides" 
    DROP CONSTRAINT IF EXISTS "_popup_banner_v_version_slides_parent_id_fk";
  `)

  // Drop tables
  await db.execute(sql`
    DROP TABLE IF EXISTS "popup_banner_slides" CASCADE;
    DROP TABLE IF EXISTS "_popup_banner_v_version_slides" CASCADE;
  `)
}
