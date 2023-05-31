#!/bin/bash

js_source_folder="public/backup/og/js"
js_destination_folder="public/backup/minified/js"

# css_source_folder="public/css"
# css_destination_folder="public/css_min"

# Uglify JavaScript files
for file in "$js_source_folder"/*.js; do
  filename=$(basename "$file")
  filename="${filename%.*}"
  uglified_file="$js_destination_folder/$filename.min.js"
  uglifyjs "$file" -o "$uglified_file"
  echo "Uglified: $uglified_file"
done

# Uglify CSS files
# for file in "$css_source_folder"/*.css; do
#   filename=$(basename "$file")
#   filename="${filename%.*}"
#   uglified_file="$css_destination_folder/$filename.min.css"
#   cssnano "$file" -o "$uglified_file"
#   echo "Uglified: $uglified_file"
# done