# Structured Data Implementation Guide

This guide explains how to add structured data to blog posts for better SEO and rich snippets in search results.

## Basic Article Structured Data

All blog posts automatically get the basic Article structured data. No extra steps required!

## How-To Structured Data (for tutorials)

For tutorial-style posts, add these fields to your post's front matter:

```yaml
howto_time: PT30M  # Estimated time using ISO 8601 duration format (PT30M = 30 minutes)
howto_steps:
  - name: "Step Title 1"
    text: "Step description 1"
  - name: "Step Title 2"
    text: "Step description 2"
  - name: "Step Title 3"
    text: "Step description 3"
```

Example:

```yaml
---
title: How to Install Jekyll on Windows
# Other normal front matter...
howto_time: PT20M
howto_steps:
  - name: "Install Ruby"
    text: "Download and install Ruby from ruby-lang.org"
  - name: "Install Jekyll"
    text: "Open command prompt and run: gem install jekyll bundler"
  - name: "Create New Site"
    text: "Run: jekyll new my-awesome-site"
---
```

## FAQ Structured Data

For posts where you want to include FAQs, add this to your front matter:

```yaml
faqs:
  - question: "Frequently asked question 1?"
    answer: "Answer to question 1"
  - question: "Frequently asked question 2?"
    answer: "Answer to question 2"
```

Example:

```yaml
---
title: Jekyll vs WordPress
# Other normal front matter...
faqs:
  - question: "Is Jekyll faster than WordPress?"
    answer: "Yes, Jekyll is typically faster because it generates static HTML files that can be served quickly with minimal server processing."
  - question: "Is Jekyll more secure than WordPress?"
    answer: "Jekyll typically has better security because it doesn't have a database or server-side processing, eliminating many common security vulnerabilities."
---
```

## Testing Your Structured Data

After implementing structured data, test it using [Google's Rich Results Test](https://search.google.com/test/rich-results).

1. Deploy your site
2. Copy your page URL
3. Paste it into the Rich Results Test
4. Check for any errors or warnings 