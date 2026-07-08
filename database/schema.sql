-- database/schema.sql
-- Lead Capture AI Agent schema
--
-- PostgreSQL 13+ includes gen_random_uuid(), so this schema does not need
-- pgcrypto or uuid-ossp for new databases.

CREATE TABLE IF NOT EXISTS leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(120)  NOT NULL,
    email           VARCHAR(255)  NOT NULL,
    business_name   VARCHAR(150),
    message         TEXT          NOT NULL,
    ai_score        VARCHAR(10)   NOT NULL DEFAULT 'Cold'
                    CHECK (ai_score IN ('Hot', 'Warm', 'Cold')),
    ai_score_reason TEXT          NOT NULL DEFAULT 'Pending AI qualification.',
    ai_email_draft  TEXT          NOT NULL DEFAULT '',
    ai_model        VARCHAR(80)   NOT NULL DEFAULT 'not_qualified_yet',
    ai_qualified_at TIMESTAMPTZ,
    qualification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (qualification_status IN ('pending', 'qualified', 'fallback', 'failed')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Upgrade helpers for databases created from the original Task 1 schema.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_score VARCHAR(10) NOT NULL DEFAULT 'Cold';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_score_reason TEXT NOT NULL DEFAULT 'Pending AI qualification.';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_email_draft TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_model VARCHAR(80) NOT NULL DEFAULT 'not_qualified_yet';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_qualified_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualification_status VARCHAR(20) NOT NULL DEFAULT 'pending';

-- Case-insensitive duplicate checks and quick admin lookups.
CREATE INDEX IF NOT EXISTS idx_leads_email_lower ON leads (lower(email));
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ai_score ON leads (ai_score);
