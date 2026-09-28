CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    base_template VARCHAR(20) NOT NULL CHECK (base_template IN ('notebook', 'standard', 'diary')),
    structure_template JSONB NOT NULL DEFAULT '{}'::jsonb,
    cover_theme VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agendas_user_id ON agendas(user_id);

CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda_id UUID NOT NULL REFERENCES agendas(id) ON DELETE CASCADE,
    page_date DATE,
    page_number INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (page_date IS NOT NULL AND page_number IS NULL)
        OR (page_date IS NULL AND page_number IS NOT NULL)
    )
);

CREATE UNIQUE INDEX idx_pages_agenda_date
    ON pages(agenda_id, page_date)
    WHERE page_date IS NOT NULL;

CREATE UNIQUE INDEX idx_pages_agenda_number
    ON pages(agenda_id, page_number)
    WHERE page_number IS NOT NULL;

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('expenses', 'checklist', 'mood', 'freetext', 'appointments')),
    section_order INTEGER NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_sections_page_id ON sections(page_id);