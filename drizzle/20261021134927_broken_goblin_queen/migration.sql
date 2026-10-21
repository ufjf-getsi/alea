CREATE TABLE "map_marker" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "map_region" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"geometry" jsonb NOT NULL,
	"min_lat" double precision NOT NULL,
	"min_lng" double precision NOT NULL,
	"max_lat" double precision NOT NULL,
	"max_lng" double precision NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "map_marker_lat_lng_idx" ON "map_marker" ("lat","lng");--> statement-breakpoint
CREATE INDEX "map_marker_created_by_idx" ON "map_marker" ("created_by");--> statement-breakpoint
CREATE INDEX "map_region_bbox_idx" ON "map_region" ("min_lat","max_lat","min_lng","max_lng");--> statement-breakpoint
CREATE INDEX "map_region_created_by_idx" ON "map_region" ("created_by");--> statement-breakpoint
ALTER TABLE "map_marker" ADD CONSTRAINT "map_marker_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "map_region" ADD CONSTRAINT "map_region_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;