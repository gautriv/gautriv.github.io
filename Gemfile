source "https://rubygems.org"

gem "jekyll"
gem "kramdown-parser-gfm"
gem "webrick", "~> 1.7"

group :jekyll_plugins do
  gem "jekyll-paginate"
end

install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
    gem "tzinfo", "~> 1.2"
    gem "tzinfo-data"
  end
  
  # Performance-booster for watching directories on Windows
  gem "wdm", "~> 0.1.1", :install_if => Gem.win_platform?