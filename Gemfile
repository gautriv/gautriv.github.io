source "https://rubygems.org"

gem "jekyll"
gem "kramdown-parser-gfm"


group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-include-cache"
  gem "liquid-c"
  gem "jekyll-paginate"
  gem 'jemoji'
  gem 'jekyll-seo-tag'
  gem "nokogiri", ">= 1.13.6"
  gem "jekyll-redirect-from"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :install_if => Gem.win_platform?

gem "webrick", "~> 1.7.0"