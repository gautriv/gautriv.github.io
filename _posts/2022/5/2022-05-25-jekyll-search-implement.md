---
title: How to implement Simple Jekyll Search on your Jekyll blog?
category: Jekyll
image: "/assets/jekyll-search.png"
header-img: "/assets/jekyll-search.png"
keywords: [jekyll search plugin, simple jekyll search, jekyll search options, jekyll search, implement jekyll search]
permalink: /jekyllsearch/
description: As the name implies, Simple Jekyll Search is very simple to integrate into your Jekyll website. It is lightweight, provides instant search results, and is simple to troubleshoot. Additionally, you can implement it in four easy steps.
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

## Credits and references
- [christian-fei](https://github.com/christian-fei) for developing [Simple Jekyll Search](https://github.com/christian-fei/Simple-Jekyll-Search). 
- [Alex Pearce](https://github.com/alexpearce) for the [idea](https://alexpearce.me/2012/04/simple-jekyll-searching/) on how it can be achieved.


{% include goodtoknow.html content="Play with your `css` and `search-script.js` file to customize the search as per your needs." %} 

If you have questions, let me know in the comments section.