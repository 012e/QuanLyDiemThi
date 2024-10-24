# Frontend

## Cách gen code với schema của openapi

### `schema.yaml`

`schema.yaml` là file viết theo spec openapi.

Nguyên tắc tên file schema: `schema-<hash viết tắt của commit>.yaml`.

### Tạo code angular từ file schema

Chạy lệnh sau để tạo code từ file schema.

```sh
npx openapi-generator-cli generate -i "tên schema" -g typescript-angular -o src/app/core/api --additional-properties fileNaming=kebab-case,withInterfaces=true --generate-alias-as-model
```
