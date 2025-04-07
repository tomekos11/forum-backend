FROM redis:latest

CMD ["redis-server", "--maxmemory", "256mb", "--appendonly", "yes"]
