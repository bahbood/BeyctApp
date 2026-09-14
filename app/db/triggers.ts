// app/db/triggers.ts

import { sql } from "drizzle-orm";

/* ============================================================
   بروزرسانی خودکار ستون updated_at
   ============================================================ */

export const updateUpdatedAt = sql`

-- ==========================================
-- Function
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- users
-- ==========================================

DROP TRIGGER IF EXISTS trigger_users_update_updated_at
ON users;

CREATE TRIGGER trigger_users_update_updated_at
BEFORE UPDATE
ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- stores
-- ==========================================

DROP TRIGGER IF EXISTS trigger_stores_update_updated_at
ON stores;

CREATE TRIGGER trigger_stores_update_updated_at
BEFORE UPDATE
ON stores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- products
-- ==========================================

DROP TRIGGER IF EXISTS trigger_products_update_updated_at
ON products;

CREATE TRIGGER trigger_products_update_updated_at
BEFORE UPDATE
ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

`;


/* ============================================================
   همگام سازی وضعیت دسترسی محصولات با فروشگاه
   ============================================================ */

export const syncProductsOutOfAccess = sql`

-- ==========================================
-- Function
-- ==========================================

CREATE OR REPLACE FUNCTION sync_products_outofaccess()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.is_outofaccess IS DISTINCT FROM OLD.is_outofaccess THEN

        UPDATE products
        SET is_outofaccess = NEW.is_outofaccess
        WHERE
            store_id = NEW.id
            AND is_outofaccess IS DISTINCT FROM NEW.is_outofaccess;

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- Trigger
-- ==========================================

DROP TRIGGER IF EXISTS trigger_sync_products_outofaccess
ON stores;

CREATE TRIGGER trigger_sync_products_outofaccess
AFTER UPDATE OF is_outofaccess
ON stores
FOR EACH ROW
EXECUTE FUNCTION sync_products_outofaccess();

`;