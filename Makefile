.PHONY: up down build logs shell db-studio db-migrate db-push db-reset seed

## Sobe todos os serviços em foreground
up:
	docker compose up

## Sobe em background
up-d:
	docker compose up -d

## Derruba os serviços
down:
	docker compose down

## Reconstrói a imagem da aplicação
build:
	docker compose build --no-cache app

## Logs do container da aplicação
logs:
	docker compose logs -f app

## Abre shell no container
shell:
	docker compose exec app sh

## Prisma Studio (interface visual do banco)
db-studio:
	docker compose exec app npx prisma studio

## Cria e aplica uma nova migration (development)
db-migrate:
	docker compose exec app npx prisma migrate dev

## Sincroniza o schema sem criar migration (útil no início)
db-push:
	docker compose exec app npx prisma db push

## Reseta o banco e reaplicada o schema (APAGA TODOS OS DADOS)
db-reset:
	docker compose exec app npx prisma db push --force-reset

## Roda o seed de dados iniciais
seed:
	docker compose exec app npx tsx prisma/seed.ts
