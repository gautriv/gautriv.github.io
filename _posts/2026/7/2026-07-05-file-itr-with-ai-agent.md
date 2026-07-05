---
title: "I Filed My ITR-2 With Capital Gains Using an AI Agent. No CA, Start to Finish."
subtitle: "A full ITR-2 with capital gains, filed on incometax.gov.in by an AI agent for AY 2026-27, with no chartered accountant. The exact journey, the real gotchas, and how you repeat it."
category: AI
image: "/assets/file-itr-with-ai-agent.png"
header-img: "/assets/file-itr-with-ai-agent.png"
seo_keywords: "file ITR with AI, ITR-2 filing guide, file income tax return without CA, agentic AI tax filing, Claude Cowork, capital gains in ITR, AIS ITR filing, AY 2026-27 ITR, new tax regime, e-verify ITR, ITR-2 capital gains, gold ETF taxation India, 80CCD(2) new regime, Section 111A 112A, self assessment tax, AI agent income tax return"
permalink: /file-itr-with-ai-agent/
og_title: "I Filed My ITR-2 With Capital Gains Using an AI Agent. No CA."
og_description: "A full ITR-2 with capital gains for AY 2026-27, filed end to end by an AI agent driving incometax.gov.in with no chartered accountant. The exact steps, the real gotchas, and how you do it too."
og_image: "/assets/file-itr-with-ai-agent.png"
twitter_card: "summary_large_image"
alt_text: "A laptop in a dim room with the income tax portal open, the cursor resting on an empty capital gains schedule."
faqs:
  - question: "Is it legal to file your ITR using an AI agent?"
    answer: "Yes. You are filing your own return on the official portal and verifying it yourself. The AI is a tool that fills forms and does math, like a very fast assistant. You remain the taxpayer and the signatory, and every sensitive step stays in your hands."
  - question: "Do I still need a chartered accountant?"
    answer: "For a standard salary plus capital gains plus interest return, no. For genuinely complex situations, business income, foreign assets, presumptive taxation, an open notice or litigation, consult a professional. The point is not to fire your CA. It is to stop paying one for tedium you can supervise yourself."
  - question: "Can the AI log in or pay for me?"
    answer: "No, and it should not. Login, OTP, and any payment are yours alone. That boundary is a safety feature, not a limitation. The agent reads documents, does the math, and fills the schedules. You keep control of identity and money."
  - question: "Which ITR form do I need if I have capital gains?"
    answer: "ITR-2, for individuals and HUFs without business income. ITR-1 does not support capital gains, so the moment you sell shares, mutual funds or ETFs, ITR-1 is off the table."
  - question: "New regime or old regime?"
    answer: "If you do not have large deductions like home loan interest, HRA, or big 80C and 80D investments, the new regime usually wins on the lower slabs alone. Have the agent compute both against your actual numbers before you commit. Do not guess."
  - question: "What if the pre-filled data is wrong?"
    answer: "It sometimes is. Mine had a wrong filing reason, unticked capital gains schedules, and a zeroed-out 80CCD(2) that would have inflated my tax bill. Always reconcile the final total income and tax against your own documents before you pay. Trust no pre-fill, human or machine."
  - question: "Is my return filed after I click Submit?"
    answer: "No. It is filed only after e-verification, by Aadhaar OTP, net-banking EVC, or the other approved methods. Verify immediately. Submit alone is not a filed return."
description: "I filed a full ITR-2 for AY 2026-27, end to end with an AI agent driving incometax.gov.in and no chartered accountant. The exact steps, the real gotchas, and how you repeat it."
---

It is July. The deadline is a few weeks out, and the annual ritual has started. The reminders. The message from your CA asking for your documents. The quiet dread of digging up a year of statements.

Most of us never question it. You gather the salary slips, the capital gains statement, the interest certificates, hand the pile over, and a few thousand rupees later someone files your return for you. That is just how it works once you have more than a salary.

This year, ask a different question. What if you never send that pile to anyone? What if an agent files it for you?

I mean an AI that reads your Form 16 and your AIS, works out the tax under both regimes, and fills every schedule on incometax.gov.in itself, while you keep your hands on the only parts that should ever be yours: the login, the OTP, the payment, the final submit.

That is what I did this year. Not with an API. Not with a script. The agent drove the income tax portal in a real browser, filled every schedule of a full ITR-2, and caught two mistakes the portal's own pre-fill had made. No chartered accountant. I watched it work, checked the math, and clicked only the things that should stay a human's job.

Before the how, here is why almost nobody tries it.

Add capital gains and filing stops being simple. You are pushed onto ITR-2 and its dozens of schedules, and every trade goes in lot by lot: sale value, cost of acquisition, holding period, the quarter it fell in. Get one wrong and the portal does not tell you. It waits, then mails you a defective-return notice weeks later.

That is why people with investments hand their taxes to a chartered accountant every year. Not because it is hard. Because it is tedious and it punishes small mistakes, which is worse than hard.

No CA. This is the full playbook, so you can do the same.

## Why I bothered

A return with capital gains runs a few thousand rupees at a CA, every year, for what is mostly data entry done on your behalf. The fee never bothered me. What bothered me was that I never once saw my own return. I signed what I was handed.

So this filing season I made a bet. Let the agent do the tedious 95 percent, the reading, the math, the schedules. I keep the few steps that should never leave a taxpayer's own hands. If the final numbers did not reconcile against my own documents, I would close the laptop and email the CA like every other year.

They reconciled to the rupee.

## What you need before you start

### The agent (Claude Cowork)

I used **Claude Cowork**, a desktop mode of Claude that can read the files in a folder you point it at and drive your browser through the **Claude in Chrome** extension.

You do not need an expensive setup. A Claude account is enough. You can run this on a paid plan or top up credits without a full subscription. Install the Claude in Chrome extension and connect it, because that is what lets the agent navigate the portal. No coding at any point.

If you are on a different agentic tool, jump to the alternatives near the end. The workflow ports over.

### A folder for your documents

Make one folder. I called mine `ITR`. Give the agent access to it. This becomes the shared workspace: the agent reads your documents from here and writes its outputs back here, the tax worksheet, this blog, whatever else.

### The documents

Drop these in:

- **Form 16 Part A and Part B**, from your employer.
- **Form 12BA**, the perquisites statement. This matters if you have RSUs or ESOPs.
- **AIS (Annual Information Statement)** and **TIS (Taxpayer Information Summary)**, downloaded from incometax.gov.in.

Bank interest certificates and a broker capital-gains statement are optional. In my case the AIS already held what I needed, but yours may not cover everything, so keep the certificates handy. More on why that one download is the most important tip in this whole guide in a minute.

### Portal access (yours, never the agent's)

Your incometax.gov.in login, PAN and password, and your Aadhaar-linked mobile for OTP. The agent never touches these. You log in yourself, every time.

### A willingness to check the numbers

That is the real prerequisite. You do not need professional help for a standard salary plus capital gains return. You do need to read the final total income and tax before you pay. The agent does the labor. You keep the judgment.

## The walkthrough, start to finish

Here is exactly how the filing went, in order.

### Step 1. Hand over Form 16 and let the agent build your tax picture

I uploaded Form 16, Part A and B, and Form 12BA. The agent read them and pulled out everything itself:

- Gross salary and any taxable perquisites (RSUs or ESOPs, if you have them, are reported through Form 12BA)
- Standard deduction, seventy-five thousand rupees under the new regime
- Any employer NPS contribution under 80CCD(2)
- Taxable salary and the TDS already deducted

Then it built a tax computation worksheet, an Excel file saved back to my folder, that calculated the tax under the new regime and matched my Form 16 to the rupee. That single check told me the return was starting from a correct base. Everything after this was built on solid ground.

### Step 2. The AIS insight: do not hand-type what the government already has

My first instinct was to key in my interest and capital gains by hand. The agent pushed back, correctly. Your AIS already holds most of what you would otherwise type: FD and savings interest, dividends, and the securities transactions reported straight from your bank, your broker, and the depositories.

It is not everything. Crypto, foreign assets, ESPP, off-market transfers, and a few brokers may not show up, so reconcile it against your own statements before you trust it. For a standard resident portfolio, though, it covers the bulk of the tedium.

So instead of typing, I:

1. Logged into incometax.gov.in, went to **Services, then AIS**, and downloaded the **AIS** as both PDF and JSON plus the **TIS**.
2. Dropped them in the folder.
3. Let the agent unlock them. AIS and TIS files are password-protected with your **PAN in lowercase plus your date of birth as DDMMYYYY**, and it extracted everything.

From the AIS alone it pulled savings and FD interest to the rupee, dividend income, and every share, mutual fund and ETF sale, each one with its sale value, cost of acquisition, and holding-period classification.

> This is the difference between a two-hour slog and a five-minute one.

### Step 3. Correct classification of every capital gain

This is where a CA usually earns the fee, and where the agent was sharpest. It classified every trade into the right bucket:

- **Equity shares and equity mutual funds, STT paid.** Short-term gains taxed at 20 percent under Section 111A, long-term at 12.5 percent under Section 112A, with a 1.25 lakh annual exemption.
- **Gold and silver ETFs.** These are not equity for tax, whatever your broker app implies. Short-term gains are taxed at your slab rate, and they need a 12-month hold to turn long-term, not 24.

That one distinction, equity versus commodity ETF, is exactly what a lot of DIY filers get wrong.

### Step 4. Pick the form and the regime

The form was ITR-2, mandatory the moment you have capital gains.

The regime was the new one, clearly. If you do not carry a home loan, HRA, or big 80C investments, the lower slabs of the new regime tend to beat the old comfortably, and the child-education, LTA and 80C deductions that would justify staying in the old regime do not exist in the new one anyway. The agent computed both against the actual numbers and confirmed it before we committed.

### Step 5. The agent drives the portal (you just log in)

With the Chrome extension connected, the agent opened incometax.gov.in. I logged in and cleared the OTP myself. The agent cannot and should not touch that. Then it took over:

- **File Income Tax Return, AY 2026-27, Online, ITR-2, Individual.**
- Selected the correct **filing reason**, "taxable income above the exemption limit." The portal had pre-selected the wrong one, a special seventh-proviso condition, which the agent fixed.
- Answered the regime question, "opt out of new regime?", with No.
- Selected the right schedules, and had to manually add **Schedule Capital Gains** and **Schedule 112A**, which the pre-fill left unchecked even though my AIS clearly showed gains.

### Step 6. Capital gains entry, done properly

This is the tedious heart of ITR-2, and the agent filled it lot by lot:

- **Section A2**, equity STCG under 111A: total sale value and cost, gain calculated.
- **Section A5**, gold and silver ETF STCG at slab rate: a separate entry.
- **Schedule 112A**, equity LTCG: the full long-term gain reported, then fully exempted under the 1.25 lakh limit, so zero tax on it.
- **Table F**, the quarter-wise accrual, filled by sale date so that Section 234C interest came out to zero. Most people skip this and pay interest they never owed.

### Step 7. The gotchas (real talk)

No automation is magic. Three things went wrong and had to be caught. This is exactly the kind of thing that trips up a manual filer too.

1. **The 80CCD(2) deduction silently showed zero eligible.** The employer-NPS amount was entered, but the portal's auto-computed "amount eligible for deduction" was stuck at zero. Left alone, that would have inflated my tax bill by a serious amount. The agent caught it while cross-checking Part B-TI, opened Schedule VI-A, and corrected the eligible amount, which brought the total income back down to the right figure.
2. **An unlabeled quarter-wise grid.** Table F's input cells had no labels. The agent had to drop a test value, read where it landed, and map the grid before filling it correctly. Worth double-checking by hand.
3. **A hidden validation error at the very end.** "Is the secondary address same as primary address?" was left blank in Part A, and the submission blocked until we answered Yes. A five-second fix, and easy to miss.

The lesson is not that the agent is unreliable. It produced no wrong numbers of its own. It caught the portal's. It did 95 percent of the work fast and clean. But clean this once is not a promise about next time, which is exactly why you, or the agent under your eye, reconcile the final Part B-TI total income and Part B-TTI tax before paying. No pre-fill gets blind trust, human or machine.

### Step 8. Verify the final numbers

Before paying, the agent reconciled the whole chain against the worksheet, field by field:

- Total income
- Tax plus surcharge plus cess
- Interest and penalty, which came to zero because Table F was filled
- TDS credit already deducted from salary
- Balance self-assessment tax still payable

The balance came to a small top-up: the tax on interest, dividends and gains that salary TDS never covered. Small, expected, unavoidable. Whatever your number is, the point is that you see the whole chain add up before a rupee moves.

### Step 9. Pay the self-assessment tax (your hands only)

I clicked **Pay Now, then e-Pay Tax**, paid the balance by UPI, and got a challan. The agent stayed out of this entirely. It never touches money movement. The challan reference then auto-populated back into the return.

### Step 10. Preview, submit, and e-verify

The agent re-checked the uploaded return JSON to confirm the challan was captured and the balance payable was now zero, then fixed the last validation flag on the secondary address. I hit **Proceed to Verification, Preview, Submit**, then **e-verified** with a net-banking EVC. Aadhaar OTP works too.

Your return is only filed once you e-verify. Submit alone is not enough.

### Step 11. The ITR-V acknowledgment

Minutes later the ITR-V acknowledgment landed in my email. Filed and verified, same day, balance payable zero. Done.

{% include v2/sponsor-slot.html %}

## What it cost versus a CA

| | AI agent (this method) | Typical CA |
|---|---|---|
| Money | The cost of a few AI credits | 1,500 to 5,000 rupees and up |
| Your time | 20 to 30 minutes of uploads, login, pay, verify | Collecting and emailing docs, then the back-and-forth |
| Control | You approve every sensitive step | You hand over your data |
| Learning | You understand your own return | Usually a black box |

## The lessons worth keeping

- **Download your AIS and TIS first.** They hold almost everything, and they turn manual entry into extraction.
- **The AIS and TIS password is your PAN in lowercase plus your DOB as DDMMYYYY.**
- **Fill Table F, the quarter-wise gains,** to avoid pointless 234C interest.
- **Always reconcile Part B-TI, total income, and Part B-TTI, final tax, before you pay.**
- **The return is not filed until you e-verify.**

## Other ways to automate this

I used Claude Cowork, but the pattern, an AI that reads your documents and drives the portal, is not tied to one tool. A couple of alternatives are worth naming.

> I have not personally run the full ITR flow on these. Based on my experience with agentic tooling, they should handle the same workflow, but treat this as a starting point, not a guarantee, and verify the final numbers yourself.

**OpenClaw**, the open-source browser agent. You could point it at incometax.gov.in and have it fill the schedules the same way, with a local model or an API key behind it. It is open and self-hostable, which is the upside. The downside is you own the setup, the prompts, and the safety guardrails, and a tax portal is an unforgiving place to debug.

**The Gemini API, if you want to build your own.** Wire Google's Gemini API to a browser-automation library like Playwright and script the same journey: parse the documents, fill the schedules, reconcile. Good for developers who want full control, more work than a ready-made agent, and the credential safety is on you.

Whatever you pick, the rules do not move. Never let the agent handle your login, your OTP, or your payments. And personally verify total income and final tax before you submit.

## Frequently asked questions

**Is it legal to file your ITR using an AI agent?**
Yes. You are filing your own return on the official portal and verifying it yourself. The AI is a tool that fills forms and does math, like a very fast assistant. You remain the taxpayer and the signatory, and every sensitive step stays in your hands.

**Do I still need a chartered accountant?**
For a standard salary plus capital gains plus interest return, no. For genuinely complex situations, business income, foreign assets, presumptive taxation, an open notice or litigation, consult a professional. The point is not to fire your CA. It is to stop paying one for tedium you can supervise yourself.

**Can the AI log in or pay for me?**
No, and it should not. Login, OTP, and any payment are yours alone. That boundary is a safety feature, not a limitation. The agent reads documents, does the math, and fills the schedules. You keep control of identity and money.

**Which ITR form do I need if I have capital gains?**
ITR-2, for individuals and HUFs without business income. ITR-1 does not support capital gains, so the moment you sell shares, mutual funds or ETFs, ITR-1 is off the table.

**New regime or old regime?**
If you do not have large deductions like home loan interest, HRA, or big 80C and 80D investments, the new regime usually wins on the lower slabs alone. Have the agent compute both against your actual numbers before you commit. Do not guess.

**What if the pre-filled data is wrong?**
It sometimes is. Mine had a wrong filing reason, unticked capital gains schedules, and a zeroed-out 80CCD(2) that would have inflated my tax bill. Always reconcile the final total income and tax against your own documents before you pay. Trust no pre-fill, human or machine.

**Is my return filed after I click Submit?**
No. It is filed only after e-verification, by Aadhaar OTP, net-banking EVC, or the other approved methods. Verify immediately. Submit alone is not a filed return.

## This was never really about taxes

Strip the ITR-2 away and look at what actually happened. I handed a boring, high-stakes, government-portal task to an agent, kept my hands on identity and money, and checked its work. The tax return was just the thing on the screen.

That shape is not special to taxes. Any chore that is mostly reading documents, doing defined math, and filling a rigid form on some website is the same job wearing different clothes. The question stopped being whether an agent can do it. The question is which of these tasks you are still doing by hand out of habit.

Filing taxes quietly turned into an ordinary computer task this year. Most people have not noticed yet.

## The last word

No documents emailed to a CA this year. No pile handed over, no fee, no waiting to be told what I owed. The agent read the papers, filled the schedules, and showed me the math. I logged in, paid the balance, e-verified, and had the ITR-V in my inbox before the coffee went cold.

The agent did not replace my judgment. It replaced the part I was paying to avoid. I still had to know what the numbers meant, still had to catch the pre-fill zeroing out a deduction I was owed, still had to press the buttons that move money and file the return. That part stays mine. It should.

Ask the different question this July. Then answer it yourself.

Review your numbers. E-verify. Done.

---

*This is a personal account, not tax advice. I am not a chartered accountant. Tax laws change and every situation differs. Verify your own figures, and consult a professional for anything complex.*
