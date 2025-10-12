.PHONY: install-uv install-deps lint format

install-uv:
	@curl -LsSf https://astral.sh/uv/install.sh | sh

install-deps:
	uv sync --all-extras --dev

lint:
	uv run ruff check meta_model pipe_catalog

format:
	uv run ruff format meta_model pipe_catalog
