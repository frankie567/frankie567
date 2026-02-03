#!/bin/bash
cd templates
for f in *.html; do
  base=$(basename "$f" .html)
  echo "File: $f -> Template name: $base"
done
