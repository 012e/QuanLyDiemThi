#!/bin/bash
echo "Trying to remove old schema file"
rm -i schema-*.yaml
HASH="$(git rev-parse --short HEAD)"
SCHEMA="schema-$HASH.yaml"


echo "Downloading schema from localhost:8000/api/schema/ to $SCHEMA"
curl 'localhost:8000/api/schema/?format=yaml&lang=en' > "$SCHEMA"

echo "Generating code using $SCHEMA"
ng-openapi-gen --input "$SCHEMA" --output src/app/core/api

echo "Adding $SCHEMA to git"
git add "$SCHEMA"
