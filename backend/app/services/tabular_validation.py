import csv
import re
import unicodedata
from pathlib import Path

from openpyxl import load_workbook


def normalize_header(value: object) -> str:
    text = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


def _read_rows(path: Path) -> list[dict[str, str]]:
    if path.suffix.lower() == ".csv":
        with path.open("r", encoding="utf-8-sig", newline="") as file:
            sample = file.read(2048)
            file.seek(0)
            try:
                dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
            except csv.Error:
                dialect = csv.excel
            reader = csv.DictReader(file, dialect=dialect)
            return [
                {normalize_header(key): str(value or "").strip() for key, value in row.items() if key is not None}
                for row in reader
            ]

    if path.suffix.lower() in {".xlsx", ".xlsm"}:
        workbook = load_workbook(path, read_only=True, data_only=True)
        sheet = workbook.active
        iterator = sheet.iter_rows(values_only=True)
        headers = [normalize_header(value) for value in next(iterator, [])]
        rows = []
        for values in iterator:
            rows.append({headers[index]: str(value or "").strip() for index, value in enumerate(values) if index < len(headers)})
        workbook.close()
        return rows
    return []


def validate_tabular_file(file_path: str) -> list[dict[str, str]]:
    """Deterministic checks for employee-like CSV/XLSX files; no LLM involved."""
    path = Path(file_path)
    rows = _read_rows(path)
    if not rows:
        return []

    aliases = {
        "name": {"nome", "name", "colaborador", "funcionario"},
        "email": {"email", "e_mail", "correio_eletronico"},
        "department": {"departamento", "department", "setor"},
        "cost_center": {"centro_custo", "centro_de_custo", "cost_center", "centro"},
    }
    headers = set().union(*(row.keys() for row in rows))
    selected = {
        key: next((candidate for candidate in candidates if candidate in headers), None)
        for key, candidates in aliases.items()
    }
    if not selected["name"] and not selected["email"]:
        return []

    findings: list[dict[str, str]] = []
    required_missing = [key for key in ("name", "email", "department") if not selected[key]]
    if required_missing:
        labels = {"name": "nome", "email": "e-mail", "department": "departamento"}
        findings.append({
            "severity": "high",
            "category": "funcionarios",
            "title": "Colunas obrigatórias ausentes na planilha",
            "description": "A planilha não contém todas as colunas esperadas: " + ", ".join(labels[key] for key in required_missing) + ".",
            "recommendation": "Solicitar uma versão da planilha com nome, e-mail e departamento dos colaboradores.",
            "source_excerpt": ", ".join(sorted(headers)),
        })

    if selected["cost_center"]:
        missing_cost = sum(1 for row in rows if not row.get(selected["cost_center"], "").strip())
        if missing_cost:
            findings.append({
                "severity": "medium",
                "category": "centros_de_custo",
                "title": f"{missing_cost} colaborador(es) sem centro de custo",
                "description": f"Foram encontrados {missing_cost} registro(s) sem centro de custo preenchido em uma planilha com {len(rows)} linha(s).",
                "recommendation": "Confirmar os centros de custo corretos com o contato do cliente antes da parametrização.",
                "source_excerpt": f"Coluna analisada: {selected['cost_center']}",
            })

    if selected["email"]:
        seen: set[str] = set()
        duplicate_count = 0
        for row in rows:
            email = row.get(selected["email"], "").strip().casefold()
            if email and email in seen:
                duplicate_count += 1
            elif email:
                seen.add(email)
        if duplicate_count:
            findings.append({
                "severity": "high",
                "category": "funcionarios",
                "title": f"Possíveis e-mails duplicados ({duplicate_count})",
                "description": f"Foram encontrados {duplicate_count} registro(s) com e-mail repetido.",
                "recommendation": "Revisar os registros duplicados com o cliente. Não excluir colaboradores sem confirmação.",
                "source_excerpt": f"Coluna analisada: {selected['email']}",
            })

    if selected["name"]:
        missing_names = sum(1 for row in rows if not row.get(selected["name"], "").strip())
        if missing_names:
            findings.append({
                "severity": "high",
                "category": "funcionarios",
                "title": f"{missing_names} registro(s) sem nome",
                "description": f"Foram encontrados {missing_names} registro(s) sem nome do colaborador.",
                "recommendation": "Solicitar a correção dos registros antes de importar a relação de colaboradores.",
                "source_excerpt": f"Coluna analisada: {selected['name']}",
            })
    return findings
