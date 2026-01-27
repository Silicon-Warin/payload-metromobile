import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_model_pricing_model_slug" AS ENUM('seal-5-dmi', 'sealion7', 'm6', 'sealion-6-dmi', 'atto3', 'dolphin', 'seal');
  CREATE TYPE "public"."enum_model_pricing_currency" AS ENUM('THB');
  CREATE TABLE "promotions_pricing_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant_id" varchar,
  	"variant_name" varchar,
  	"promo_price" numeric,
  	"original_price" numeric,
  	"down_payment" numeric,
  	"interest_rate" numeric
  );
  
  CREATE TABLE "_promotions_v_version_pricing_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant_id" varchar,
  	"variant_name" varchar,
  	"promo_price" numeric,
  	"original_price" numeric,
  	"down_payment" numeric,
  	"interest_rate" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "model_pricing_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"original_price" numeric
  );
  
  CREATE TABLE "model_pricing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"model_slug" "enum_model_pricing_model_slug" NOT NULL,
  	"currency" "enum_model_pricing_currency" DEFAULT 'THB' NOT NULL,
  	"base_price" numeric NOT NULL,
  	"region" varchar,
  	"effective_date" timestamp(3) with time zone NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "promotions_benefits" ADD COLUMN "variant_name" varchar;
  ALTER TABLE "_promotions_v_version_benefits" ADD COLUMN "variant_name" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "model_pricing_id" integer;
  ALTER TABLE "promotions_pricing_overrides" ADD CONSTRAINT "promotions_pricing_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_promotions_v_version_pricing_overrides" ADD CONSTRAINT "_promotions_v_version_pricing_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_promotions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "model_pricing_variants" ADD CONSTRAINT "model_pricing_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."model_pricing"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "promotions_pricing_overrides_order_idx" ON "promotions_pricing_overrides" USING btree ("_order");
  CREATE INDEX "promotions_pricing_overrides_parent_id_idx" ON "promotions_pricing_overrides" USING btree ("_parent_id");
  CREATE INDEX "_promotions_v_version_pricing_overrides_order_idx" ON "_promotions_v_version_pricing_overrides" USING btree ("_order");
  CREATE INDEX "_promotions_v_version_pricing_overrides_parent_id_idx" ON "_promotions_v_version_pricing_overrides" USING btree ("_parent_id");
  CREATE INDEX "model_pricing_variants_order_idx" ON "model_pricing_variants" USING btree ("_order");
  CREATE INDEX "model_pricing_variants_parent_id_idx" ON "model_pricing_variants" USING btree ("_parent_id");
  CREATE INDEX "model_pricing_model_slug_idx" ON "model_pricing" USING btree ("model_slug");
  CREATE INDEX "model_pricing_updated_at_idx" ON "model_pricing" USING btree ("updated_at");
  CREATE INDEX "model_pricing_created_at_idx" ON "model_pricing" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_model_pricing_fk" FOREIGN KEY ("model_pricing_id") REFERENCES "public"."model_pricing"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_model_pricing_id_idx" ON "payload_locked_documents_rels" USING btree ("model_pricing_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promotions_pricing_overrides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_promotions_v_version_pricing_overrides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "model_pricing_variants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "model_pricing" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "promotions_pricing_overrides" CASCADE;
  DROP TABLE "_promotions_v_version_pricing_overrides" CASCADE;
  DROP TABLE "model_pricing_variants" CASCADE;
  DROP TABLE "model_pricing" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_model_pricing_fk";
  
  DROP INDEX "payload_locked_documents_rels_model_pricing_id_idx";
  ALTER TABLE "promotions_benefits" DROP COLUMN "variant_name";
  ALTER TABLE "_promotions_v_version_benefits" DROP COLUMN "variant_name";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "model_pricing_id";
  DROP TYPE "public"."enum_model_pricing_model_slug";
  DROP TYPE "public"."enum_model_pricing_currency";`)
}
