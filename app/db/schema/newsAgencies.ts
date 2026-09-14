// app/db/schema/newsAgencies.ts
import { sql } from 'drizzle-orm';
import { boolean, decimal, pgEnum, pgTable, serial, text, timestamp, varchar,check } from 'drizzle-orm/pg-core';
export const dynamic = 'force-dynamic'

export const newsAgencies = pgTable('newsAgencies', {
  id: serial('id').primaryKey(),
  onAir:boolean('onAir').default(false),
  newsAgency_Name:   varchar('newsAgency_Name', { length: 50 }).notNull().unique(),
  newsAgency_Desc:   varchar('newsAgency_Desc', { length: 500 }),
  newsAgency_About:  varchar('newsAgency_about'),

  newsAgency_Manager:varchar('newsAgency_Manager', { length: 150 }).notNull(),

  newsAgency_Adress: varchar('newsAgency_Adress', { length: 250 }),
  newsAgency_Tell:   varchar('newsAgency_Tell', { length: 11 }),
  newsAgency_Mobile: varchar('newsAgency_Mobile', { length: 11 }),
  
  createdAt:  timestamp('created_at').defaultNow().notNull(),
  updatedAt:  timestamp('updated_at').defaultNow().notNull(),

  

  isValid:    boolean('isValid').default(true),
  expired_At:timestamp('expired_At').defaultNow().notNull(),
 
});


export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  isValid:    boolean('isValid').default(true),
  
  onAir: boolean('onAir').default(false),
  report_Name: varchar('report_Name', { length: 50 }).notNull().unique(),
  report_Desc: varchar('report_Desc', { length: 500 }),
  
  
});