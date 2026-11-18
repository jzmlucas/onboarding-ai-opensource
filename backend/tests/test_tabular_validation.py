from app.services.tabular_validation import validate_tabular_file


def test_employee_csv_reports_missing_cost_center_and_duplicate_email(tmp_path):
    file_path = tmp_path / "employees.csv"
    file_path.write_text(
        "nome,email,departamento,centro_custo\n"
        "Ana,ana@example.test,Financeiro,CC-01\n"
        "Bruno,bruno@example.test,Marketing,\n"
        "Bruno,bruno@example.test,Marketing,\n",
        encoding="utf-8",
    )

    findings = validate_tabular_file(str(file_path))
    titles = [finding["title"] for finding in findings]

    assert any("sem centro de custo" in title for title in titles)
    assert any("e-mails duplicados" in title for title in titles)
