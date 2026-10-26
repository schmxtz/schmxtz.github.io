source "https://rubygems.org"

# GitHub Pages builds this site itself and ignores this file. It's only for
# previewing locally: same Jekyll major version and plugins as Pages, without
# the github-pages meta-gem and its many native extensions.
gem "jekyll", "~> 3.10"
gem "kramdown-parser-gfm"

group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-seo-tag"
end

# Windows has no zoneinfo files.
platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "webrick"

# Dropped from Ruby's default gems in 3.4+, still needed by Jekyll 3.
gem "base64"
gem "bigdecimal"
gem "csv"
gem "logger"
