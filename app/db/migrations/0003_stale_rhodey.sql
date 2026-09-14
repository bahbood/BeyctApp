CREATE TABLE "slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(25) NOT NULL,
	"fullName" varchar(25) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"show_startDate" timestamp NOT NULL,
	"show_endDate" timestamp NOT NULL,
	"isActive" boolean DEFAULT false,
	CONSTRAINT "slides_name_unique" UNIQUE("name"),
	CONSTRAINT "slides_fullName_unique" UNIQUE("fullName")
);
