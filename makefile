.PHONY: install-uv install-deps lint format

install-uv:
	@curl -LsSf https://astral.sh/uv/install.sh | sh

install-deps:
	uv sync --all-extras --dev

lint:
	uv run ruff check --fix meta-model pipe-catalog

format:
	uv run ruff format meta-model pipe-catalog
