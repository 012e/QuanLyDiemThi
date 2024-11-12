#!/bin/bash
echo "Trying to remove old schema file"
rm -i schema-*.yaml
HASH="$(git rev-parse --short HEAD)"
SCHEMA="schema-$HASH.yaml"
curl 'localhost:8000/api/schema/?format=yaml&lang=en' > "$SCHEMA"
npx openapi-generator-cli generate -i "$SCHEMA" -g typescript-angular -o src/app/core/api --additional-properties fileNaming=kebab-case,withInterfaces=true --generate-alias-as-model
