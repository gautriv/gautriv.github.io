---
title: How to Add Lightning-Fast Search to Your Jekyll Blog in 4 Simple Steps
category: Jekyll
image: "/assets/jekyll-search.png"
header-img: "/assets/jekyll-search.png"
keywords: [jekyll search plugin, simple jekyll search, jekyll search options, jekyll search, implement jekyll search]
permalink: /jekyllsearch/
description: Transform your Jekyll site with instant search functionality in just minutes! This step-by-step guide shows you exactly how to implement Simple Jekyll Search - a lightweight, easy-to-customize solution that helps readers find your content quickly. No complex coding required.
howto_time: PT20M
howto_steps:
  - name: Add search.json file
    text: "Add search.json at your home location. The location where you have your index.html file."
  - name: Add the JavaScript file
    text: "Add search-script.js in your js folder if you have one, otherwise add it at your home location."
  - name: Add search HTML
    text: "Add search.html in your _includes folder."
  - name: Include the search bar
    text: "Add search.html at the location where you want your system to display the search bar or functionality."
faqs:
  - question: "Do I need coding experience to add search to my Jekyll blog?"
    answer: "No, you don't need extensive coding experience. You just need to follow the steps to add three files to your Jekyll site and everything will work. The process is designed to be simple for beginners."
  - question: "Will adding search slow down my Jekyll site?"
    answer: "No, Simple Jekyll Search is very lightweight and won't impact your site's loading speed. It's client-side JavaScript that works efficiently with a small JSON file."
  - question: "Can I customize how the search results look?"
    answer: "Yes, you can fully customize the appearance of the search results by modifying the CSS and the search.html template. You can change colors, fonts, spacing, and even add result thumbnails."
  - question: "What's the difference between Simple Jekyll Search and other options like Algolia?"
    answer: "Simple Jekyll Search is free and doesn't require any third-party services, while options like Algolia offer more advanced features but may require paid plans for larger sites. Simple Jekyll Search is perfect for most blogs and small to medium sites."
---

# Implementing simple Jekyll search

There are numerous methods for incorporating search into your Jekyll website. Some of them are difficult to implement, but others are simple. One such tool is Simple Jekyll Search. It is very simple to incorporate into your Jekyll website. If you want you can go for:

- Google search
- Algolia
- Lunr
  
In the subsequent articles, we'll go over how to use different search engines. In this blog, I'll show you how to use a Jekyll search plugin to construct a simple Jekyll search functionality.

## Features
- Light weight 
- Displays instant search results
- Easy to implement
- Easy debugging process

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7149683584202371"
     crossorigin="anonymous"></script>
<!-- AddTitleOne -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7149683584202371"
     data-ad-slot="7422872052"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

## Prerequisites
- A json file, for example, [search.json](https://github.com/gautriv/gautriv.github.io/blob/main/search.json).
- HTML elements for search bar, for example, [search.html](https://github.com/gautriv/gautriv.github.io/blob/main/_includes/search.html).
- A JavaScript file, for example, [search-script.js](https://github.com/gautriv/gautriv.github.io/blob/main/js/search-script.js).

## Procedures
1. Add **search.json** at your home location. The location where you have your index.html file.
2. Add **search-script.js** in your js folder if you have one, otherwise add it at your home location.
3. Add **search.html** in your `_includes` folder.

    {% include note.html content="Update the **search.html** file with the exact location of **search.json** and **search-script.js** files." %} 

4. Add **search.html** at the location where you want your system to display the search bar or functionality.

## Why Your Jekyll Blog Needs Search Functionality

Adding search to your Jekyll blog provides several important benefits:

1. **Improves user experience** - Visitors can quickly find exactly what they're looking for
2. **Increases page views** - Readers discover more of your content through search results
3. **Reduces bounce rates** - Keep visitors on your site longer when they can easily navigate
4. **Enhances content discovery** - Makes your older posts more findable and valuable
5. **Competitive advantage** - Many Jekyll blogs lack search, making yours stand out

## What to Do After Implementing Search

Once you've added search to your Jekyll blog, take these next steps:

1. **Test thoroughly** - Try various search terms to ensure results are accurate
2. **Customize styling** - Match the search box design to your site's theme
3. **Announce the feature** - Let your readers know about the new search functionality
4. **Monitor usage** - Check your analytics to see how visitors use the search feature

## Need Help With Your Jekyll Site?

Having trouble with the implementation? Need a custom Jekyll solution? I'm here to help! 

**Get in touch today:**
- Email me at [contact@yourdomain.com](mailto:contact@yourdomain.com)
- Connect on [LinkedIn](https://linkedin.com/in/gauravtrivedi1988)
- Leave a comment below with your specific question

Subscribe to my newsletter for more Jekyll tips and tricks delivered straight to your inbox!

## Credits and references
- [christian-fei](https://github.com/christian-fei) for developing [Simple Jekyll Search](https://github.com/christian-fei/Simple-Jekyll-Search). 
- [Alex Pearce](https://github.com/alexpearce) for the [idea](https://alexpearce.me/2012/04/simple-jekyll-searching/) on how it can be achieved.


{% include goodtoknow.html content="Play with your `css` and `search-script.js` file to customize the search as per your needs." %} 

If you have questions, let me know in the comments section.