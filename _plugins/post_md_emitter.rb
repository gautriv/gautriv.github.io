# Emits a paired `<slug>.md` alongside every rendered post, containing the
# raw Markdown source (not the rendered HTML). Read by AI agents / LLM tools.
#
# We use a post_write hook so the output bypasses Jekyll's kramdown pipeline
# entirely — a Jekyll::Page with a .md extension would be re-rendered to HTML
# and would mangle the YAML frontmatter delimiters.
require 'fileutils'

module Jekyll
  Jekyll::Hooks.register :site, :post_write do |site|
    site.posts.docs.each do |post|
      next unless post.path && File.exist?(post.path)

      raw = File.read(post.path)
      # Strip the post's existing YAML frontmatter — we re-emit a minimal one.
      body = raw.sub(/\A---\s*\n.*?\n---\s*\n/m, '').lstrip

      front = [
        '---',
        %(title: "#{post.data['title'].to_s.gsub('"', '\\"')}"),
        "author: #{(post.data['author'] || 'Gaurav Trivedi').to_s.gsub(/<[^>]+>/, '').strip}",
        "date: #{post.date.iso8601}",
        "canonical: #{File.join(site.config['url'].to_s, post.url)}",
        "category: #{post.data['category']}",
        '---',
        ''
      ].join("\n")

      content = front + "\n# #{post.data['title']}\n\n" + body

      # /taking-yourself-out-of-the-equation/ -> /taking-yourself-out-of-the-equation.md
      rel_path = post.url.sub(%r{/\z}, '') + '.md'
      out_path = File.join(site.dest, rel_path)
      FileUtils.mkdir_p(File.dirname(out_path))
      File.write(out_path, content)
    end
  end
end
