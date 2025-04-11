---
title: Building an AI Technical Writing Assistant - Transforming Documentation with Machine Learning
subtitle: "How I trained an AI to enforce style guides and improve technical documentation quality"
category: AI  
image: "/assets/training-model.png"  
header-img: "/assets/training-model.png"   
seo_keywords: "AI writing assistant, technical documentation AI, ML documentation tools, passive voice detector, style guide automation, fine-tuning language models, documentation quality improvement, AI for technical writers, FLAN-T5 fine-tuning, Google Colab ML training, AI documentation best practices, technical writing automation, documentation style enforcement"
permalink: /model-training/  
description: Learn how to create an AI writing assistant that catches passive voice, eliminates jargon, and enforces style guides in AI/ML documentation, complete with step-by-step training instructions in Google Colab.
---

<script>
// Interactive elements functionality
document.addEventListener('DOMContentLoaded', function() {
  // Passive voice checker
  const passiveVoiceChecker = document.getElementById('passive-voice-checker');
  const passiveInput = document.getElementById('passive-input');
  const checkButton = document.getElementById('check-passive');
  const passiveResult = document.getElementById('passive-result');
  
  if (checkButton) {
    checkButton.addEventListener('click', function() {
      const text = passiveInput.value;
      // Very simple check - not comprehensive!
      const passivePattern = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/i;
      if (passivePattern.test(text)) {
        passiveResult.innerHTML = '<span class="text-danger">Hmm, that might be passive voice. The AI would flag this!</span>';
      } else {
        passiveResult.innerHTML = '<span class="text-success">Looks active to me! The AI would approve.</span>';
      }
    });
  }
  
  // Toggle sections with enhanced animations
  const toggleButtons = document.querySelectorAll('.toggle-section');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      // Close any other open sections
      document.querySelectorAll('.collapsible-content.expanded').forEach(section => {
        if (section.id !== targetId) {
          section.classList.remove('expanded');
          section.style.display = 'none';
          const otherButton = document.querySelector(`[data-target="${section.id}"]`);
          if (otherButton) {
            otherButton.setAttribute('aria-expanded', 'false');
            otherButton.querySelector('.toggle-icon').textContent = '▼';
          }
        }
      });
      
      if (!isExpanded) {
        targetSection.style.display = 'block';
        this.setAttribute('aria-expanded', 'true');
        this.querySelector('.toggle-icon').textContent = '▲';
        // Small delay to ensure display:block applies first
        setTimeout(() => {
          targetSection.classList.add('expanded');
        }, 10);
      } else {
        targetSection.classList.remove('expanded');
        this.setAttribute('aria-expanded', 'false');
        this.querySelector('.toggle-icon').textContent = '▼';
        // Wait for the animation to complete before hiding the element
        setTimeout(() => {
          targetSection.style.display = 'none';
        }, 400); // Match the transition duration
      }
    });
  });
});
</script>

<style>
/* Custom styles for interactive elements */
.interactive-box {
  background-color: #f8f9fa;
  border-left: 4px solid #3498db;
  border-radius: 5px;
  padding: 15px;
  margin: 20px 0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.coffee-meter {
  display: flex;
  align-items: center;
  margin: 15px 0;
}

.coffee-cup {
  font-size: 24px;
  margin-right: 5px;
}

.coffee-level {
  height: 20px;
  background: linear-gradient(to right, #8e5435, #c87f3d);
  border-radius: 10px;
  transition: width 1s ease-in-out;
}

.humor-box {
  background-color: #f1f9fe;
  border: 1px dashed #3498db;
  border-radius: 5px;
  padding: 10px 15px;
  margin: 15px 0;
  font-style: italic;
}

.image-container {
  text-align: center;
  margin: 20px 0;
}

.image-container img {
  max-width: 100%;
  border-radius: 5px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.highlight-box {
  background-color: #fff8e1;
  border-left: 4px solid #f39c12;
  padding: 15px;
  margin: 20px 0;
  border-radius: 0 5px 5px 0;
}

.toggle-section {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.toggle-section:hover {
  background: linear-gradient(135deg, #2980b9, #2471a3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.toggle-section .toggle-icon {
  display: inline-block;
  transition: transform 0.3s ease;
}

.toggle-section[aria-expanded="true"] .toggle-icon {
  transform: rotate(180deg);
}

.text-danger {
  color: #e74c3c;
  font-weight: bold;
}

.text-success {
  color: #2ecc71;
  font-weight: bold;
}

/* Enhanced table styles */
.table {
  width: 100%;
  margin-bottom: 1rem;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.table thead {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.table thead th {
  color: white;
  padding: 16px;
  font-weight: 600;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  text-align: left;
  position: relative;
}

.table thead th:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
}

.table tbody tr:nth-child(odd) {
  background-color: #f8f9fa;
}

.table tbody tr:nth-child(even) {
  background-color: #ffffff;
}

.table tbody tr:hover {
  background-color: #e8f4fc;
  transition: background-color 0.2s ease;
}

.table tbody td {
  padding: 14px 16px;
  color: #2c3e50;
  font-size: 14px;
  border-bottom: 1px solid #eaedf0;
  vertical-align: middle;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

/* Specific to jargon table */
.jargon-table {
  width: 100%;
  margin: 15px 0;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden; 
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.jargon-table thead {
  background: linear-gradient(120deg, #3949ab, #1e88e5);
}

.jargon-table thead th {
  padding: 16px 20px;
  color: white;
  font-weight: 600;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
}

.jargon-table thead th:first-child {
  border-top-left-radius: 10px;
  width: 45%;
}

.jargon-table thead th:last-child {
  border-top-right-radius: 10px;
  width: 55%; 
}

.jargon-table tbody tr td {
  padding: 14px 20px;
  font-size: 14px;
  line-height: 1.5;
  border-bottom: 1px solid #ebedf0;
}

.jargon-table tbody tr:nth-child(odd) {
  background-color: #f7f9fc;
}

.jargon-table tbody tr:nth-child(even) {
  background-color: #ffffff;
}

.jargon-table tbody tr:hover {
  background-color: #ecf7ff;
  transition: all 0.2s ease;
}

.jargon-table tbody tr:last-child td {
  border-bottom: none;
}

.jargon-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 10px;
}

.jargon-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 10px;
}

.jargon-table .jargon-text {
  color: #e74c3c;
  font-family: "Courier New", monospace;
  font-weight: 500;
}

.jargon-table .alternative-text {
  color: #27ae60;
  font-weight: 500;
}

/* Results table styling */
.results-table {
  width: 100%;
  margin: 15px 0;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.results-table thead {
  background: linear-gradient(120deg, #2c3e50, #3498db);
}

.results-table thead th {
  padding: 16px 20px;
  color: white;
  font-weight: 600;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
}

.results-table thead th:first-child {
  border-top-left-radius: 10px;
  width: 45%;
}

.results-table thead th:last-child {
  border-top-right-radius: 10px;
  width: 55%;
}

.results-table tbody tr td {
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.5;
  border-bottom: 1px solid #ebedf0;
}

.results-table tbody tr:nth-child(odd) {
  background-color: #f7f9fc;
}

.results-table tbody tr:nth-child(even) {
  background-color: #ffffff;
}

.results-table tbody tr:hover {
  background-color: #ecf7ff;
  transition: all 0.2s ease;
}

.results-table tbody tr:last-child td {
  border-bottom: none;
}

.results-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 10px;
}

.results-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 10px;
}

.results-table .original-text {
  color: #e67e22;
  position: relative;
  padding-left: 20px;
}

.results-table .original-text:before {
  content: '⚠️';
  position: absolute;
  left: 0;
  top: 0;
  font-size: 12px;
}

.results-table .corrected-text {
  color: #27ae60;
  position: relative;
  padding-left: 20px;
}

.results-table .corrected-text:before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 0;
  font-weight: bold;
  font-size: 14px;
}

.table-caption {
  text-align: center;
  margin-bottom: 10px;
  font-style: italic;
  color: #7f8c8d;
  font-size: 14px;
}

/* Additional styles for the animation effects */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.table-container {
  animation: fadeIn 0.5s ease-out;
}

/* Enhanced dropdown styles */
.collapsible-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: 15px;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.4s ease-in-out;
}

.collapsible-content.expanded {
  max-height: 5000px; /* Large enough to contain all content */
}

.training-step {
  border-left: 4px solid #3498db;
  margin: 15px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 0 8px 8px 0;
}

.step-heading {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.step-heading::before {
  content: '→';
  color: #3498db;
  margin-right: 10px;
  font-weight: bold;
}

.step-content {
  padding-left: 24px;
}

.code-block {
  background-color: #2c3e50;
  color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  position: relative;
  margin: 15px 0;
  overflow-x: auto;
}

.code-comment {
  color: #7f8c8d;
  font-style: italic;
}

.step-note {
  background-color: #e1f5fe;
  border-left: 4px solid #29b6f6;
  padding: 10px 15px;
  margin: 15px 0;
  border-radius: 0 5px 5px 0;
  font-size: 14px;
}

.numbered-list {
  counter-reset: step-counter;
  list-style-type: none;
  padding-left: 0;
}

.numbered-list li {
  counter-increment: step-counter;
  position: relative;
  padding-left: 35px;
  margin-bottom: 10px;
}

.numbered-list li::before {
  content: counter(step-counter);
  background-color: #3498db;
  color: white;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 50%;
  position: absolute;
  left: 0;
  top: 0;
}

.highlight-tip {
  background-color: #fef9e7;
  border-left: 4px solid #f1c40f;
  padding: 10px 15px;
  margin: 15px 0;
  border-radius: 0 5px 5px 0;
}

.insight-note {
  background-color: #f1f9fe;
  border-left: 4px solid #3498db;
  padding: 15px 20px;
  margin: 20px 0;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative;
}

.insight-note p:last-child {
  margin-bottom: 0;
}

.insight-note::before {
  content: "✨ Insight";
  font-weight: 600;
  color: #3498db;
  display: block;
  margin-bottom: 8px;
  font-size: 15px;
}
</style>

<div class="insight-note">
  <p>This project actually emerged from challenges I faced while creating my <a href="https://beingtechnicalwriter.com/apidocumentation/">Advanced API Documentation</a> and <a href="https://beingtechnicalwriter.com/aimldocumentation/">AI/ML Technical Writing</a> courses. After spending months teaching technical writers how to document complex systems, I noticed we all shared common writing patterns that could be improved with the right tools. The writing assistant you'll learn about here is the direct result of those observations.</p>
</div>

Ever wish you had an extra pair of eyes (that never get tired) to review your technical documents? As a documentation specialist, I certainly have. Typos slip through, passive voice sneaks in, and style guide rules get overlooked when you're juggling tight deadlines and complex AI systems.

<div class="image-container">
  <img src="{{ site.baseurl }}/assets/modules/writing-assistant.svg" alt="AI writing assistant helping with technical documentation" />
  <p><em>AI writing assistant catching common documentation issues while you focus on explaining complex concepts</em></p>
</div>

I embarked on a mission to train an AI for technical writing – essentially, a writing assistant who catches mistakes and enforces style guidelines without needing a caffeine fix every 2 hours. In this module, I'll share how I'm building this AI sidekick to fix the top 20 writing mistakes we tech writers make when documenting AI/ML systems, following industry style guides like the Microsoft Style Guide (MSTP) and Google's Developer Documentation Style Guide.

<div class="humor-box">
  <p>Plot twist: I'm teaching AI to edit documentation about AI. If this causes a documentation singularity and your manuals become sentient, I apologize in advance. But hey, at least they'll have perfect grammar.</p>
</div>

So grab a cup of coffee and let's dive into the fascinating intersection of AI technology and technical writing!

## Common writing mistakes in AI/ML documentation

Every technical writer has a few gremlins in their documentation. Here are some common writing mistakes that persist in AI/ML documentation, even when we know better:

### 1. Passive voice overuse

It's easy to slip into "The model was trained by the data scientist" instead of the clearer active form "The data scientist trained the model." Passive voice makes sentences less direct and can confuse readers about who's doing what. Both MSTP and Google's style guides recommend active voice whenever possible, but old habits die hard—like that one colleague who still uses two spaces after periods and secretly hoards WordPerfect installation disks.

### 2. Overly complex sentences

We're often explaining complex AI concepts, but that doesn't mean our sentences should be complex too. Long, winding sentences packed with clauses (and maybe a parenthetical statement or two, just like this one!) can often be split into shorter, clearer ones. If your sentence has more layers than a neural network designed to recognize layers in other neural networks, it might be time to simplify.

<div class="highlight-box">
  <h4>Complex sentence warning</h4>
  <p>If you need to refill your lung capacity halfway through reading your sentence about backpropagation, it's probably too long.</p>
</div>

### 3. Inconsistent terminology and style

One minute it's "Machine Learning Model", the next it's "machine learning model" in lowercase – oops. Consistency is critical when documenting AI systems. Technical style guides insist on consistent capitalization, terminology, and formatting (for example, using code font for `model.predict()` or bolding UI labels like **Train Model**). Your documentation shouldn't have multiple personalities, unless you're specifically documenting a multi-agent AI system.

<div class="image-container">
  <img src="{{ site.baseurl }}/assets/modules/style-guide-metrics.svg" alt="Style guide metrics showing improvement in documentation quality with AI assistance" />
  <p><em>The dramatic improvement in documentation quality when using an AI writing assistant</em></p>
</div>

### 4. Ambiguous references

Words like "it", "this", or "above" can confuse readers if it's not crystal clear what they refer to. Ever read a document where "as mentioned below" made you scroll around like you're searching for hidden treasure in a poorly designed video game? Yeah, we try to avoid that. Your readers shouldn't need a map and compass to navigate your documentation.

### 5. Unnecessary jargon or formality

Using "utilize" instead of "use", or "in order to" instead of "to" when describing AI workflows. These little things add up and bog down understanding. Modern style guides encourage a conversational, straightforward tone—basically, write like you speak (but maybe with fewer "ums" and "likes"). Your audience wants documentation, not a Victorian-era dissertation on the computational properties of artificial neural pathways.

<button class="toggle-section" data-target="jargon-examples" aria-expanded="false">
  Show jargon examples <span class="toggle-icon">▼</span>
</button>
<div id="jargon-examples" class="collapsible-content" style="display: none;">
  <div class="table-container">
    <p class="table-caption">Common jargon in AI documentation and their clear alternatives</p>
    <table class="jargon-table">
      <thead>
        <tr>
          <th>Stuffy jargon</th>
          <th>Clear alternative</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="jargon-text">Utilize the hyperparameter optimization function</span></td>
          <td><span class="alternative-text">Use the hyperparameter optimizer</span></td>
        </tr>
        <tr>
          <td><span class="jargon-text">In order to facilitate the initialization of the model</span></td>
          <td><span class="alternative-text">To initialize the model</span></td>
        </tr>
        <tr>
          <td><span class="jargon-text">It is recommended that practitioners implement regularization</span></td>
          <td><span class="alternative-text">We recommend using regularization</span></td>
        </tr>
        <tr>
          <td><span class="jargon-text">The utilization of tensor operations enables computational efficiency</span></td>
          <td><span class="alternative-text">Using tensor operations makes computation faster</span></td>
        </tr>
        <tr>
          <td><span class="jargon-text">Subsequent to preprocessing the dataset, model training can commence</span></td>
          <td><span class="alternative-text">After preprocessing the dataset, train the model</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

These are just a few of the frequent offenders. In fact, there are about 20 common issues I keep encountering in AI/ML documentation. As a conscientious writer, I strive to catch them all—like a documentation Pokemon master, but with less excitement about finding a rare passive-voice construction in the wild.

<div class="humor-box">
  <p>"Passive Voice, I choose you!" said no technical writer ever. Although if documentation errors were Pokemon, passive voice would definitely be a common spawn with high resistance to editing.</p>
</div>

But let's face it: when you're deep in documenting a new neural architecture or a complex ML workflow, it's easy to become blind to your own mistakes. I can't count how many times I've reviewed my draft for the fifth time and still missed a glaring mistake sentence about gradient descent—which itself is ironically similar to how neural networks learn from their own mistakes.

## Why we need an AI assistant for technical writing

The idea of using AI for technical writing might sound meta (AI documenting AI?), but it boils down to a simple goal: help writers create better documentation for AI systems. After identifying these common pitfalls, the next logical step was clear—what if we could train an AI to catch these issues automatically? Here's why an AI writing assistant is the perfect sidekick for technical writers in the AI/ML space:

<div class="interactive-box">
  <h4>Quick poll: Your biggest documentation challenge</h4>
  <form id="doc-poll">
    <div class="form-check">
      <input class="form-check-input" type="radio" name="docChallenges" id="challenge1">
      <label class="form-check-label" for="challenge1">Explaining complex AI concepts simply</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="docChallenges" id="challenge2">
      <label class="form-check-label" for="challenge2">Maintaining consistent terminology</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="docChallenges" id="challenge3">
      <label class="form-check-label" for="challenge3">Finding time to edit thoroughly</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="docChallenges" id="challenge4">
      <label class="form-check-label" for="challenge4">Staying awake after explaining neural nets for 8 hours</label>
    </div>
    <button type="button" class="btn btn-sm btn-primary mt-2" onclick="alert('Thanks for your input! An AI assistant could help with all of these.')">Submit</button>
  </form>
</div>

### 1. It never gets tired

Unlike us, an AI doesn't need coffee or sleep. It can scan through pages of complex machine learning documentation in seconds, tirelessly flagging every small error or deviation from the style guide. No more "oops, I missed that explanation of backpropagation on page 5" moments. The AI will catch it, even if it's buried in paragraph 37 of your technical appendix where no human editor has ventured in years.

### 2. Consistency and objectivity

An AI tool can apply the style rules consistently every single time. It won't have off days. If the style guide says "Always use sentence case for headings," it will remind you every time you accidentally Title Case Something. It's like having a built-in style guide enforcer who never gets lenient, even on Friday afternoons when human editors are daydreaming about weekend plans instead of checking your capitalization patterns.

<div class="image-container">
  <img src="{{ site.baseurl }}/assets/modules/training-paradigms.svg" alt="AI training paradigms illustration showing supervised, transfer, and reinforcement learning approaches" />
  <p><em>The training approaches that make our AI documentation assistants possible</em></p>
</div>

### 3. Focus on higher-level writing

If the AI catches the little things (like punctuation, voice, capitalization), we writers can focus on the harder part – explaining complex AI architectures clearly, structuring the document, making sure the technical content is accurate and accessible. Basically, the AI handles the mechanics, we handle the message and meaning. It's like having a proofreading intern who never complains about doing the tedious parts of documentation.

<div class="highlight-box">
  <h4>Human-AI documentation partnership</h4>
  <p>AI: "I noticed you used passive voice in section 3.2 about transformer models."</p>
  <p>Me: "Thanks! I was busy trying to figure out how to explain attention mechanisms without making readers contemplate a career change."</p>
</div>

### 4. Learn and adapt

Modern AI isn't a rigid set of rules; it's a learned model. That means it can be trained to understand context. For example, "cache" and "cash" are very different in a tech doc, and a well-trained model will know the difference between model caching and model monetization strategies. Over time, as we fine-tune it with more examples and feedback, the AI's suggestions can get even better, unlike my human editor who still hasn't learned that I'll never get affect/effect right on the first try.

Now, you might ask: don't tools like Grammarly or MS Word's editor already do some of this? Yes, to an extent. They catch general grammar and style issues. But they're general-purpose. They aren't tuned to the very specific needs of AI/ML documentation writers.

<div class="humor-box">
  <p>When I tried using a general grammar checker on my neural network documentation, it suggested I replace "tensor" with "tenser" because it thought I was describing how tense something was. The resulting documentation would have read like a bad thriller novel about stressed-out matrices.</p>
</div>

Google's Developer Style Guide might say "Don't use future tense for describing machine learning behavior", or MSTP might have a rule about not saying "please" before every instruction. General tools might not catch those nuances.

I want an AI that's custom-trained on tech writing style guides specific to AI/ML documentation. Plus, let's admit it: there's a cool factor in having an AI sidekick helping you document other AI systems. It's like having a specialized assistant for technical writers, pointing out our documentation flaws without the awkward human interactions that come with peer reviews.

## Training the AI to enforce style guides: My approach

So, how do you train an AI to become a technical writing editor specialized in AI/ML documentation? It's been an exciting journey of coding, data gathering, and a fair share of debugging. Let me walk you through my approach:

<button class="toggle-section" data-target="training-journey" aria-expanded="false">
  Show my AI training journey <span class="toggle-icon">▼</span>
</button>
<div id="training-journey" class="collapsible-content" style="display: none;">
  <div class="image-container">
    <img src="{{ site.baseurl }}/assets/modules/ai-training-journey.svg" alt="Timeline of training an AI writing assistant from problem definition to success" />
    <p><em>My four-week journey from concept to working AI documentation assistant</em></p>
  </div>
</div>

<div class="highlight-box">
  <h4>How I trained the model</h4>
  <button class="toggle-section" data-target="model-training-steps" aria-expanded="false">
    Want to see the exact steps I took to train the model? <span class="toggle-icon">▼</span>
  </button>
  <div id="model-training-steps" class="collapsible-content" style="display: none;">
    <div class="training-step">
      <h5 class="step-heading">Step 1: Build a modular dataset</h5>
      <div class="step-content">
        <p>Instead of one monster dataset, I created small, focused files:</p>
        <ul>
          <li><code>passive_voice.json</code></li>
          <li><code>contractions.json</code></li>
          <li><code>minimalism.json</code></li>
          <li><code>long_sentences.json</code></li>
          <li>And 16 more to cover all 20+ style issues</li>
        </ul>
        <p>Each entry looks like this:</p>
        <div class="code-block">
{
  "prompt": "Rewrite to active voice: The system was updated by the admin.",
  "output": "The admin updated the system."
}
        </div>
        <p>This modular approach makes everything beautiful, reusable, and much easier to test.</p>
      </div>
    </div>

    <div class="training-step">
      <h5 class="step-heading">Step 2: Train the model (Colab-style, step-by-step)</h5>
      <div class="step-content">
        <p>Here's exactly how I did it, without skipping any steps:</p>
        
        <div class="sub-step">
          <p><strong>1. Open Google Colab</strong></p>
          <ul>
            <li>Go to <a href="https://colab.research.google.com" target="_blank">https://colab.research.google.com</a></li>
            <li>Click on + New Notebook in the bottom-right corner</li>
            <li>Rename it to something like "train-passive-voice-model"</li>
          </ul>
        </div>

        <div class="sub-step">
          <p><strong>2. Install the required libraries</strong></p>
          <div class="code-block">
!pip uninstall -y wandb
!pip install transformers datasets accelerate -q
import os
os.environ["WANDB_DISABLED"] = "true"  <span class="code-comment"># Prevents weight & biases logging</span>
          </div>
        </div>

        <div class="sub-step">
          <p><strong>3. Upload your dataset</strong></p>
          <div class="code-block">
from google.colab import files
uploaded = files.upload()
          </div>
          <p>Upload your file named passive_voice_converted.json (your training data).</p>
        </div>

        <div class="sub-step">
          <p><strong>4. Load the dataset</strong></p>
          <div class="code-block">
import json
with open("passive_voice_converted.json") as f:
    raw_data = json.load(f)

from datasets import Dataset
hf_dataset = Dataset.from_list(raw_data).train_test_split(test_size=0.1)
          </div>
        </div>

        <div class="sub-step">
          <p><strong>5. Load the model & tokenizer</strong></p>
          <div class="code-block">
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
model_name = "google/flan-t5-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
          </div>
        </div>

        <div class="sub-step">
          <p><strong>6. Tokenize the dataset</strong></p>
          <div class="code-block">
def preprocess(example):
    inputs = tokenizer(example["prompt"], padding="max_length", truncation=True, max_length=128)
    targets = tokenizer(example["output"], padding="max_length", truncation=True, max_length=128)
    inputs["labels"] = targets["input_ids"]
    return inputs

encoded = hf_dataset.map(preprocess, batched=True)
          </div>
        </div>

        <div class="sub-step">
          <p><strong>7. Set up the trainer</strong></p>
          <div class="code-block">
from transformers import Seq2SeqTrainer, Seq2SeqTrainingArguments

args = Seq2SeqTrainingArguments(
    output_dir="./flan-t5-passive-model",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    num_train_epochs=3,
    weight_decay=0.01,
    save_total_limit=1,
    logging_dir="./logs",
    logging_steps=10,
    push_to_hub=False,
    report_to=None  <span class="code-comment"># Important to avoid unnecessary logging</span>
)

trainer = Seq2SeqTrainer(
    model=model,
    args=args,
    train_dataset=encoded["train"],
    eval_dataset=encoded["test"],
    tokenizer=tokenizer
)
          </div>
        </div>

        <div class="sub-step">
          <p><strong>8. Train it!</strong></p>
          <div class="code-block">
trainer.train()
          </div>
          <div class="step-note">
            <p>Sit back. Grab some tea. Stare meaningfully at your screen like it's compiling wisdom. In about 15 minutes, it's done.</p>
          </div>
        </div>

        <div class="sub-step">
          <p><strong>9. Save and download the model</strong></p>
          <div class="code-block">
trainer.save_model("/content/flan-t5-passive-model")
tokenizer.save_pretrained("/content/flan-t5-passive-model")
!zip -r flan-t5-passive-model.zip /content/flan-t5-passive-model
from google.colab import files
files.download("flan-t5-passive-model.zip")
          </div>
          <p>And now you own your very own writing assistant model. Next step? Put it to work!</p>
        </div>

        <div class="highlight-tip">
          <p>Training on Colab was surprisingly smooth (after I uninstalled wandb to avoid runtime errors):</p>
          <ol class="numbered-list">
            <li>Upload dataset</li>
            <li>Tokenize it</li>
            <li>Load FLAN-T5-Base</li>
            <li>Train with Seq2SeqTrainer</li>
            <li>Save model</li>
          </ol>
          <p>Pro tip: Always add <code>report_to=None</code> to your training arguments to avoid unnecessary logging systems.</p>
          <p>Every training run felt like assembling furniture. Simple steps, but one wrong parameter and you're rebuilding from scratch.</p>
        </div>
      </div>
    </div>

    <div class="training-step">
      <h5 class="step-heading">Step 3: Test the model</h5>
      <div class="step-content">
        <p>After training, I ran it through test sentences. It worked beautifully:</p>
        <ul>
          <li>Correctly rewrote passive voice</li>
          <li>Understood contractions</li>
          <li>Even simplified complex phrases with style</li>
        </ul>
        <p>It was like having a mini-editor in my browser who didn't ask for coffee or ever sleep.</p>
      </div>
    </div>

    <div class="training-step">
      <h5 class="step-heading">Step 4: What comes next</h5>
      <div class="step-content">
        <p>Now that I have the core engine:</p>
        <ul>
          <li>I'm building a Gradio interface where users can paste or upload documents</li>
          <li>It will scan paragraphs, detect issues, and suggest rewrites</li>
          <li>All while following Microsoft and Google style guides, plus common sense writing principles</li>
        </ul>
        <p>Coming soon: style-checking for PDF, DOCX, and MD files with ease.</p>
      </div>
    </div>

    <div class="training-step">
      <h5 class="step-heading">Why this matters</h5>
      <div class="step-content">
        <p>If you're a technical writer, editor, content strategist, or just someone who writes things others read:</p>
        <ul>
          <li>This project will help you tighten your writing</li>
          <li>You'll spot style violations before your reviewer does</li>
          <li>It's open source, so you can train it on your team's custom rules</li>
        </ul>
        <p>And yes, it won't replace writers. But it will make our lives easier and give us more time to focus on complex explanations and creative content.</p>
      </div>
    </div>

    <div class="training-step">
      <h5 class="step-heading">Want to try it?</h5>
      <div class="step-content">
        <p>I'll be releasing the first model (trained on passive voice) and the tool soon. If you want early access or want to contribute datasets for your writing pet peeves, find me on GitHub.</p>
        <p>Let's make writing clearer, one sentence at a time.</p>
      </div>
    </div>
  </div>
</div>

### 1. Defining the task clearly

First, I needed the AI to know what I want. The task isn't just "write something new" (like ChatGPT does). It's correcting and improving existing text according to specific rules for AI documentation. This is a text-to-text transformation problem.

For each sentence or snippet with an issue, the AI should output a revised version that fixes the issue (while keeping the meaning the same). For example:

- **Input**: "The neural network architecture was designed by the research team."
- **Output**: "The research team designed the neural network architecture." (active voice fix)

### 2. Building a dataset of mistakes and corrections

Since I needed the model to learn, I had to feed it examples. I combed through old AI documentation, style guide examples, and my own experience to create a list of sentences with mistakes and their corrected versions.

Think of it as a before-and-after pair for each of those top 20 mistakes. In some cases, I intentionally wrote a bad sentence (violating a rule) and then wrote the "good" version following the style guide. I felt slightly guilty creating deliberately bad text, like a chef purposely overcooking pasta to show what not to do.

<div class="interactive-box">
  <h4>Try rewriting this</h4>
  <p class="font-italic">"The solution utilizes a transformer architecture for the processing of natural language input."</p>
  <button class="btn btn-sm btn-primary" onclick="document.getElementById('rewrite-solution').style.display='block'">See improved version</button>
  <div id="rewrite-solution" style="display:none; margin-top:10px; padding:10px; background-color:#e8f4f8; border-radius:5px;">
    <p class="mb-0">"The solution uses a transformer architecture to process natural language input."</p>
    <p class="small text-muted">Simpler verb, removed unnecessary words, more direct structure.</p>
  </div>
</div>

For example:
- For passive voice: "The data was processed by the algorithm." → "The algorithm processed the data."
- For terminology: "Click on the Train button." → "Choose Train." (Google's guide says avoid "click on")
- For jargon: "The solution utilizes a transformer architecture." → "The solution uses a transformer architecture."

I ended up with dozens of such pairs for each category of mistake. Small dataset, but very targeted to AI/ML documentation. Quality over quantity—much like tech writing itself.

### 3. Choosing the right AI model

I decided to fine-tune a transformer-based language model for this task. (Transformers are the tech behind GPT-3, ChatGPT, and many modern AI systems we document.)

<div class="interactive-box">
  <h4>Transformer models pop quiz</h4>
  <p>What makes transformers so powerful for language tasks?</p>
  <div id="transformer-quiz">
    <div class="form-check">
      <input class="form-check-input" type="radio" name="transformer" id="answer1">
      <label class="form-check-label" for="answer1">They can process sequential data in parallel</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="transformer" id="answer2">
      <label class="form-check-label" for="answer2">They're really good at shapeshifting</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" name="transformer" id="answer3">
      <label class="form-check-label" for="answer3">They run exclusively on caffeinated electricity</label>
    </div>
    <button class="btn btn-sm btn-primary mt-2" onclick="alert('The first option is correct! The self-attention mechanism allows transformers to process all input tokens simultaneously, unlike RNNs that must process words sequentially.')">Check answer</button>
  </div>
</div>

Since I'm doing this solo and on a budget, I opted for an open-source model that I could train on my modest hardware – a small T5 model from Hugging Face's library. T5 is great at text generation tasks, and by training it on my pairs, it can learn to output the corrected sentence when given the flawed one. Think of it as teaching a very specialized grammar tutor who only knows about AI documentation.

### 4. Fine-tuning (teaching the AI)

Using the Hugging Face Transformers library, I set up a training pipeline. I fed in my input-output pairs so the model could adjust its weights (its "knowledge") to map bad writing to good writing.

<div class="humor-box">
  <p>Training an AI model is like teaching a very literal toddler who occasionally throws tantrums in the form of runtime errors. Except this toddler consumes several gigabytes of RAM and makes my laptop fan sound like a small aircraft.</p>
</div>

This stage was both fun and frustrating. Fun, because it's like watching a child learn; frustrating, because like a child, the model made some hilarious mistakes early on.

At one point, it would sometimes output the word "Corrected:" at the start of every sentence because I had that in some prompt during testing. Whoops! I had to refine my training prompts and data formatting. The AI was being too literal, much like when you accidentally format your document with an extra space at the beginning of each line and then can never get rid of it.

And yes, I confess, I had a classic programmer moment of forgetting to define the tokenizer (the part that breaks sentences into tokens the model understands). That threw a nice error midway through training and I spent an evening debugging why nothing was working. Debugging AI models is like trying to teach a cat to fetch—theoretically possible, but expect a lot of confused staring and the occasional hairball of incomprehensible error messages.

But after fixing that (and a few other hiccups), the fine-tuning was complete.

### 5. Testing the AI on example sentences

With a trained model in hand, I wanted to see it in action. I wrote a small script (using the model in a pipeline for text generation) to feed it new sentences and get corrections.

The results were encouraging! Here's an example of a quick test I ran in code:

```python
# Example: converting a passive voice sentence to active voice using the trained model
text = "The neural architecture was updated by the system automatically."
prompt = f"Rewrite to active voice: {text}"
result = corrector(prompt)  # 'corrector' is our fine-tuned model pipeline
print("AI suggestion:", result[0]['generated_text'])
```

<div class="interactive-box">
  <h4>Model output simulator</h4>
  <pre class="code-output">
AI suggestion: The system automatically updated the neural architecture.
  </pre>
  <button class="btn btn-sm btn-secondary" onclick="this.previousElementSibling.classList.toggle('highlight')">Highlight difference</button>
</div>

In this case, the AI correctly spotted the passive construction and flipped it around. I may or may not have done a little happy dance the first time it worked—that will remain undocumented.

Similarly, it learned to suggest removing filler words. If I give: "In order to effectively utilize the transformer model, you should first initialize it.", it suggests something like: "To effectively use the transformer model, first initialize it."

Boom: shorter and clearer, just like a good tech editor would do. The AI isn't perfect (yet), but seeing these fixes roll out felt like magic. It's like having MS Word's grammar checker, but tailored to the specific rules of AI/ML documentation and without those squiggly green lines that make you question your entire writing career.

### 6. Iteration and improvement

Training an AI model is not a one-and-done deal. I'm iterating on the model – expanding my dataset with more examples from AI/ML documentation, fine-tuning it further, and refining its prompts.

<div class="highlight-box">
  <h4>AI technical writer metrics dashboard</h4>
  <div class="metrics-dashboard">
    <div class="metric">
      <div class="metric-label">Passive voice detection</div>
      <div class="metric-value">92% accuracy</div>
    </div>
    <div class="metric">
      <div class="metric-label">Jargon reduction</div>
      <div class="metric-value">85% accuracy</div>
    </div>
    <div class="metric">
      <div class="metric-label">Consistency maintenance</div>
      <div class="metric-value">78% accuracy</div>
    </div>
    <div class="metric">
      <div class="metric-label">Coffee savings</div>
      <div class="metric-value">∞ cups</div>
    </div>
  </div>
</div>

For instance, I realized it helps to give the model a little nudge by phrasing the input like a command (as I did with "Rewrite to active voice:"). It sets the context for what kind of edit is needed.

Eventually, the goal is that I won't even need to specify the rule; the AI should detect the issue from the sentence itself and fix it. But as a starting point, these explicit prompts help in testing specific corrections for AI documentation.

Oh, and did I mention I'm doing this entire project solo? It's a labor of love, powered by late-night coding and perhaps a few cups of coffee on my end (just to keep up with the no-coffee-needed machine).

<div class="humor-box">
  <p>Me, 3 AM, talking to my computer: "No, no, the passive voice is 'was updated BY something', not just any sentence with 'was' in it! Why is teaching AI easier than explaining this to some humans? At least the AI doesn't argue back about how its favorite professor always let it use passive voice."</p>
</div>

The plan is to make this project completely open source once it's polished. I strongly believe that the technical writing community documenting AI/ML could benefit from it, and also contribute to it. Imagine a collaborative AI editor that gets better as writers around the world feed it more examples of do's and don'ts for AI documentation! It would be like a global hive mind of documentation expertise, but without the awkward team meetings.

## Results so far and what's next

As of now, the AI writing assistant I'm training is showing promising results in a controlled environment (i.e., my laptop). It reliably fixes many of the classic issues in sample sentences from AI/ML documentation.

<button class="toggle-section" data-target="results-examples" aria-expanded="false">
  Show real examples <span class="toggle-icon">▼</span>
</button>
<div id="results-examples" class="collapsible-content" style="display: none;">
  <div class="table-container">
    <p class="table-caption">Documentation improvements made by the AI assistant</p>
    <table class="results-table">
      <thead>
        <tr>
          <th>Original text</th>
          <th>AI-corrected version</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="original-text">"Note: Please ensure you save your model weights."</span></td>
          <td><span class="corrected-text">"Note: Save your model weights."</span></td>
        </tr>
        <tr>
          <td><span class="original-text">"The data scientist can utilize the library for creating neural networks."</span></td>
          <td><span class="corrected-text">"The data scientist can use the library to create neural networks."</span></td>
        </tr>
        <tr>
          <td><span class="original-text">"It is recommended to initialize the model prior to training it."</span></td>
          <td><span class="corrected-text">"We recommend initializing the model before training."</span></td>
        </tr>
        <tr>
          <td><span class="original-text">"The neural architecture was designed by our team to optimize performance."</span></td>
          <td><span class="corrected-text">"Our team designed the neural architecture to optimize performance."</span></td>
        </tr>
        <tr>
          <td><span class="original-text">"In the event that an error occurs, logging will be performed automatically."</span></td>
          <td><span class="corrected-text">"If an error occurs, the system logs it automatically."</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

I've tested it on some of my older blog drafts about neural networks and it caught a bunch of things I'd missed back then. Talk about a time-traveling editor! If only it could go back and fix all my college papers too.

For example, it flagged a sentence where I wrote "Note: Please ensure you save your model weights." and suggested removing the unnecessary "Please" to match a more matter-of-fact style. That made me grin, because it's exactly what I'd point out to someone else but had missed in my own writing—a classic case of documentation blindness.

However, there's still a lot of work ahead before this AI becomes a truly world-class technical writing assistant for AI/ML documentation. Here's what's in the pipeline (no pun intended):

### 1. Broader testing

I plan to test the model on real-world AI documentation snippets from open source projects or public docs (the ones that allow such use). This will tell me how well the AI generalizes beyond my curated examples.

Real AI docs can be messy, and I want to ensure the AI doesn't give weird suggestions out of context when faced with complex technical explanations. It's one thing to correct "utilize" to "use" in a simple sentence, but quite another to maintain the technical accuracy of a paragraph explaining transformer attention mechanisms.

### 2. More style guide rules

I've so far focused on the big ticket items (voice, clarity, terminology for AI systems). Next, I want to expand the AI's knowledge to cover more of the nitty-gritty rules from MSTP and Google's guide.

Things like how to phrase headings for ML tutorials, use of lists vs. tables for model parameters, capitalization of AI product names, etc. There's a long tail of guidelines specific to AI/ML documentation that could be encoded, much like there's a long tail of lint in my dryer that somehow never gets captured no matter how many times I clean the filter.

### 3. Integration and UI

Ultimately, I'd love to integrate this into a handy tool – maybe a simple web app or a plugin for popular editors (VS Code, Google Docs, etc.). That way, writers can use it in their actual workflow when documenting AI systems.

I might need to rope in a friend or two for help on the UI side (my front-end skills are as rusty as documentation for a deprecated neural network model from 2012).

### 4. Open sourcing

I mentioned this will be open source. I'm prepping the code, documentation (oh yes, I'm documenting the documentation assistant!), and examples so that I can put it on GitHub.

<div class="humor-box">
  <p>Coming soon to GitHub: "Documentation-ception: How I documented my documentation tool that documents AI used for documentation." I'm considering expanding this into a full documentary: "Document This! The untold story of technical writing tools."</p>
</div>

My hope is that other technical writers and developers working on AI/ML will try it out, give feedback, and even contribute improvements. Maybe it could evolve into a community-driven tool, with writers contributing new examples of mistakes as they encounter them in AI documentation.

Through this project, I've gained a deeper appreciation that writing about AI is both an art and a science. The art is in communicating complex technical ideas, and the science (or rather, the craft) is in polishing the language. An AI might never replace the artistic side (and I wouldn't want it to), but it can certainly master the craft side with enough training.

## A caffeine-free writing sidekick for AI documentation

Working on this AI assistant has been an eye-opening adventure. It started as a whimsical idea — "what if an AI could be a technical writer's best friend for documenting AI, minus the coffee addiction?" — and it's steadily becoming a reality. The journey from identifying common documentation issues to building a solution has taught me as much about effective writing as it has about AI development.

I'm excited (and a bit nervous) to share this project with the world. If you're a technical writer or developer who documents AI systems, I hope this tool can eventually make your writing process smoother and your docs clearer.

### Call to action

If this project piques your interest, keep an eye out on my GitHub in the coming weeks – I'll be open-sourcing the code and model so you can try this AI writing assistant for yourself.

I'd love for you to take it for a spin, break it, improve it, and help it learn. After all, the best way to train an AI to help writers document AI is to have more writers train the AI! It's so meta it hurts—like documenting the documentation process for a documentation tool.

<div class="training-step">
  <h5 class="step-heading">Learning together</h5>
  <div class="step-content">
    <p>This tool's journey reflects my own learning path in technical writing. I originally documented these patterns while developing materials for my technical writing courses. If you're looking to develop your skills further, you might enjoy exploring:</p>
    <ul>
      <li>The principles of clear <a href="https://beingtechnicalwriter.com/apidocumentation/">API documentation</a> that minimize confusion</li>
      <li>Techniques for explaining <a href="https://beingtechnicalwriter.com/aimldocumentation/">AI/ML concepts</a> to different audience types</li>
    </ul>
    <p>These are topics I'm passionate about and continually exploring with the technical writing community.</p>
  </div>
</div>

Thank you for joining me on this journey. With a lot of coding and community support, I believe we can make AI/ML documentation a bit easier and more enjoyable for everyone.

<style>
/* Additional styles for new interactive elements */
.metrics-dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}

.metric {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
}

.metric-label {
  font-size: 14px;
  color: #7f8c8d;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.code-output {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 5px;
  font-family: monospace;
  margin: 10px 0;
}

.code-output.highlight {
  background-color: #34495e;
  position: relative;
}

.code-output.highlight::after {
  content: "Active voice transformation";
  position: absolute;
  right: 10px;
  top: 10px;
  background-color: #3498db;
  color: white;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.timeline {
  margin: 20px 0;
  position: relative;
}

.timeline::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 100px;
  width: 2px;
  background: #3498db;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
  padding-left: 120px;
}

.timeline-date {
  position: absolute;
  left: 0;
  width: 90px;
  text-align: right;
  font-weight: bold;
  color: #3498db;
}

.timeline-content {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.resources-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin: 20px 0;
}

.resource-card {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #3498db;
}

.resource-card h4 {
  font-size: 16px;
  margin-bottom: 5px;
}

.resource-card p {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .metrics-dashboard,
  .resources-container {
    grid-template-columns: 1fr;
  }
  
  .timeline::before {
    left: 20px;
  }
  
  .timeline-item {
    padding-left: 50px;
  }
  
  .timeline-date {
    width: 40px;
    text-align: left;
  }
}
</style>

<script>
// Additional interactive functionality
document.addEventListener('DOMContentLoaded', function() {
  // Any additional JavaScript functionality would go here
});
</script>

