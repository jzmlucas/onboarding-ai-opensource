from sqlalchemy import select

from app.db.database import SessionLocal, init_db
from app.db.models import Onboarding


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        existing = db.scalar(select(Onboarding).where(Onboarding.company_name == "Grupo Aurora"))
        if existing:
            print(f"Onboarding de demonstração já existe: {existing.id}")
            return
        onboarding = Onboarding(
            company_name="Grupo Aurora",
            tax_id="12.345.678/0001-90",
            contact_name="Mariana Costa",
            contact_email="mariana@grupoaurora.example",
            description="Empresa fictícia para demonstrar a análise de documentos e o copiloto OnboardIA.",
        )
        db.add(onboarding)
        db.commit()
        print(f"Onboarding de demonstração criado: {onboarding.id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
