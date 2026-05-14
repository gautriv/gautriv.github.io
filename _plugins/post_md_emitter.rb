module Jekyll
  class PostMarkdownPage < Jekyll::Page
    def initialize(site, base, post)
      @site = site
      @base = base
      @dir  = File.dirname(post.url)
      @name = File.basename(post.url) + '.md'
      self.process(@name)
      self.data = {
        'layout' => nil,
        'title'  => post.data['title'],
        'sitemap' => false,
        'permalink' => post.url.sub(%r{/$}, '') + '.md'
      }
      front = {
        'title' => post.data['title'],
        'author' => post.data['author'] || 'Gaurav Trivedi',
        'date' => post.date.iso8601,
        'canonical' => File.join(site.config['url'].to_s, post.url),
        'category' => post.data['category'],
      }
      yaml_front = front.map { |k,v| "#{k}: #{v}" }.join("\n")
      body = post.content.gsub(/<[^>]+>/, '')
      self.content = "---\n#{yaml_front}\n---\n\n# #{post.data['title']}\n\n#{body}"
    end
  end

  class PostMarkdownGenerator < Jekyll::Generator
    safe true
    priority :low
    def generate(site)
      site.posts.docs.each do |post|
        site.pages << PostMarkdownPage.new(site, site.source, post)
      end
    end
  end
end
