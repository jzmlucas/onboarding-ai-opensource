from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.db.models import Base

engine = create_engine(settings.database_url, pool_pre_ping=True, pool_size=5, max_overflow=10)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def init_db() -> None:
    with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    Base.metadata.create_all(bind=engine)
    # create_all does not alter existing tables. Keep this small forward-compatible
    # column migration here because this MVP currently has no migration runner.
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE onboardings ADD COLUMN IF NOT EXISTS contact_whatsapp VARCHAR(20)"))
        connection.execute(text("ALTER TABLE onboardings ADD COLUMN IF NOT EXISTS whatsapp_mode VARCHAR(24) NOT NULL DEFAULT 'ai_active'"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_onboardings_contact_whatsapp ON onboardings (contact_whatsapp)"))
        connection.execute(text("ALTER TABLE customer_issues ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(36) REFERENCES customer_conversations(id) ON DELETE SET NULL"))
        connection.execute(text("ALTER TABLE customer_issues ADD COLUMN IF NOT EXISTS assistant_reply TEXT"))
        connection.execute(text("ALTER TABLE customer_issues ADD COLUMN IF NOT EXISTS reply_status VARCHAR(24) NOT NULL DEFAULT 'pending'"))
        connection.execute(text("ALTER TABLE customer_issues ADD COLUMN IF NOT EXISTS reply_error TEXT"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_customer_issues_conversation_id ON customer_issues (conversation_id)"))
        connection.execute(text("""
            INSERT INTO customer_conversations
                (id, onboarding_id, contact_phone, mode, created_at, updated_at)
            SELECT gen_random_uuid()::text, onboarding_id, sender_phone, 'ai_active', now(), now()
            FROM customer_issues
            WHERE conversation_id IS NULL
            GROUP BY onboarding_id, sender_phone
            ON CONFLICT (onboarding_id, contact_phone) DO NOTHING
        """))
        connection.execute(text("""
            UPDATE customer_issues AS issue
            SET conversation_id = conversation.id
            FROM customer_conversations AS conversation
            WHERE issue.conversation_id IS NULL
              AND conversation.onboarding_id = issue.onboarding_id
              AND conversation.contact_phone = issue.sender_phone
        """))


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
