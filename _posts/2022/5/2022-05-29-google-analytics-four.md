---
title: "Jekyll GA4 Setup Guide: Save Your Analytics Data Before It's Lost Forever!"
category: Jekyll
image: "/assets/ga4_jekyll_website.png"
header-img: "/assets/ga4_jekyll_website.png"
keywords: [google analytics for jekyll, google analytics ga4 vs ua, ga4 properties, ga4 jekyll blog, set up ga4 properties in Jekyll, jekyll blog analytics, GA4 migration, Universal Analytics sunset, GA4 code installation, GA4 tracking, Jekyll website analytics, GA4 implementation]
permalink: /google-analytics-four/
description: Don't lose your website data! This step-by-step GA4 setup guide for Jekyll blogs shows exactly how to migrate from Universal Analytics before the July 2023 deadline. Complete with code examples, troubleshooting tips, and verification steps to ensure your analytics continue working flawlessly.
howto_time: PT30M
howto_steps:
  - name: "Sign in to Google Analytics"
    text: "Sign in to your Google Analytics account."
  - name: "Access GA4 Setup Assistant" 
    text: "Click the gear icon and locate GA4 Setup Assistant in the Property column, then click Get Started."
  - name: "Create GA4 Property"
    text: "Click Create Property. The system will display your GA4 property name (G-xxxxxxxxxx) and a success message."
  - name: "Locate your Google Analytics code"
    text: "Browse to the location where you've previously implemented the gtag.js code, typically in the head of your Default layout or in your includes folder."
  - name: "Update your Analytics code"
    text: "Add your new GA4 property name to your existing Google Analytics code snippet without removing the Universal Analytics property."
  - name: "Verify Implementation"
    text: "Use the real-time reports feature in GA4 to confirm your site is sending data correctly."
faqs:
  - question: "Do I need to remove my Universal Analytics code when adding GA4?"
    answer: "No, you should keep both until July 2023. This dual implementation allows you to compare data between both systems and ensures a smooth transition."
  - question: "Will my historical data transfer to GA4 automatically?"
    answer: "No, historical data won't automatically transfer to GA4. That's why it's important to set up GA4 early - so you can start collecting data in the new format while keeping your historical UA data accessible."
  - question: "How is GA4 different from Universal Analytics?"
    answer: "GA4 is fundamentally different in that it's event-based rather than session-based. It offers more flexible tracking, better cross-platform analytics, and enhanced user privacy controls. The reporting interface and measurement methodology are also completely redesigned."
  - question: "Will GA4 affect my site's loading speed?"
    answer: "GA4 is designed to be more lightweight than Universal Analytics, so it typically has less impact on page load times. The code implementation is very similar, so you shouldn't notice any performance changes when adding GA4."
---

# Implementing Google Analytics four (GA4) property

Do you use standard Google Universal Analytics (UA) on your Jekyll Blog? If yes, then the time is ripe for you to use GA4 instead of UA property.

## Why do you need to use the GA4 property?
Google has stated that it would cease processing new data in standard properties starting July 1, 2023. Yes, you have time, but don't you want to compare Universal Analytics properties to GA4 properties? Don't you want to import your existing data into the Google Analytics4 property?

## How to set up Google Analytics4 properties?

### Prerequisites
1. You have a Google Analytics account.
2. You have already enabled Google Analytics for your website.

### Procedures
3. Sign in to your Google Analytics account.
4. Click the <i class="fa fa-gear"></i> icon. The system displays three columns; Account, Property, and View.
5. In the Property column, select **GA4 Setup Assistant**, and click **Get Started**.
   
   {% include note.html content="If you have used the gtag.js (a JavaScript library) tag in your Jekyll website, GA4 offers you to Enable data collection using your existing tags." %}

7. Click **Create Property**. The system displays your GA4 property name (G-xxxxxxxxxx) and a message indicating that you have successfully connected your properties.
   
   {% include goodtoknow.html content="The setup wizard:
   <br>* Creates a new GA4 property
   <br>* Copies the name, URL, timezone, and other settings from your existing property
   <br>* Activates the enhanced measurement
   <br>* Establishes a connection between Standard Analytics and GA4 properties" %} 
8. Copy and save your GA4 property name for future use.

## What changes do you need in your Jekyll website?

You now have a GA4 property name. Use it on your Jekyll website.

### Procedures
1. Browse to the location where you have used the _gtag.js_ (a JavaScript library) tag.
   
   {% include goodtoknow.html content="Generally, users include the _gtag.js_ at the _head_ of the _Default_ layout. Additionally, you may have placed the Google Analytics (gtag.js tag) code in your _includes folder." %}
   
2. You have two options, either add the GA4 property name or update the entire Google Analytics code. 
   
    {% include note.html content="If you go later, you will lose the ability to track your website data using Universal Analytics. Therefore, it is best to add the GA4 property name to your Google Analytics code." %}

3. Add the GA4 property name to your Google Analytics code.
   
    ```sh
   <!-- Global site tag (gtag.js) - Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=UA-xxxxxxxxx-x"></script>
   <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'UA-xxxxxxxxx-x');
      gtag('config', 'G-xxxxxxxxxx');
   </script>

    ```

    **UA-xxxxxxxxx-x** = Your Universal Analytics property.

    **G-xxxxxxxxxx** = Your GA4 property.

## How to Verify Your GA4 Setup is Working Correctly

After implementing GA4, follow these verification steps to ensure it's tracking properly:

1. **Check real-time reports**: Visit your GA4 property and go to Reports > Realtime. Open your Jekyll site in another tab and navigate through a few pages. You should see activity in your real-time report.

2. **Verify events are tracking**: GA4 automatically tracks page views as events. Check Reports > Events to confirm these are being recorded.

3. **Set up additional events**: Consider tracking important user actions such as:
   - File downloads
   - Outbound link clicks 
   - Form submissions
   - Scroll depth

## Next Steps: Getting the Most from GA4

Now that you've successfully implemented GA4 on your Jekyll site, take these additional steps:

1. [Set up conversion events](https://support.google.com/analytics/answer/9267735) to track important goals
2. Create custom [explorations](https://support.google.com/analytics/answer/7020612) to analyze your data in depth
3. Connect GA4 to Google Search Console for comprehensive SEO insights

Need help implementing advanced GA4 features on your Jekyll site? [Contact me](mailto:your@email.com) for personalized assistance or leave a comment below with your specific questions!

Congratulations! You have successfully configured your Jekyll website to use Google Analytics four (GA4) property. You may need to wait for 48 hours for data to appear in your GA4 property.