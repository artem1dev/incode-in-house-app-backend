# Incode in house

## Table of contents
1. [Installing](#installing)

## Installing

### Getting Started

To get started with the project, follow these steps:

- Install all dependencies:

   ```bash
   npm install
   ```

### Running database with Docker (Optional)

If you prefer to use Docker, the repository contains a `docker-compose.yml` file. It includes configurations for the database.

```bash
docker-compose up
```

If you choose to host the database locally, it's up to you.

### Environment Configuration

Each app includes an `example.env` file. You should create the environment files in each app.

You can use the `example.env` file as a template.

### Running the Applications

- **Development**:

  ```bash
  npm run start:dev
  ```
## App

### Endpoints

- ```api/v1/draftPost/:user_id```
   - Body (form-data):
      - amount - amount in cents
      - country - string
   - Curl example:
   ```
      curl -X POST "http://<BASE_URL>/api/payment/create" \
      -H "Content-Type: multipart/form-data" \
      -F "amount=1000"
      -F "country=Ukraine"
   ```