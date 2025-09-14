# 🎓 Daabi

**Project Type:** Student platform for raising demands, discussions, sharing campus moments, tracking issues, and campus buy-sell marketplace.

**Goal:** Build Daabi iteratively, starting with MVP and expanding features over time, for both web (Next.js App Router) and mobile (React Native). Backend folder exists but remains empty for now.

---

## 🚀 FEATURES

The platform has the following features:

### 1. 📱 **Feed**
- A Facebook-like feed where students can see posts, discussions, top demands, posts, videos, pictures and campus news. Users can also interact with the items in the feed like facebook.

### 2. 💬 **Discussion**
- A Reddit-style discussion section with multi-thread commenting feature.  
- Top discussions are sorted by upvotes/downvotes, popularity, and engagement.  
- Users can create new discussions, comment, and interact.

### 3. 📋 **Demands Tab**
- Demands are a bigger problem, consisting of multiple issues.
- Students can create demands or requests for the authorities.
- Demand page will showcase these demands, sorting the top demands based on contributions and interactions in that particular demand.
- Top demands are sorted by agreement, popularity, and category (department, club, hall, environment).  
- Users can vote in agreement or disagreement with the demand.
- Users can discuss the demand in multi-thread comment sections like Reddit.
- The user can create various events (like in Facebook) under a demand to raise support for it.
- If a demand from an authorized body is created, they can raise funds for it using the crowdfunding section.

## 🔧 4. **Issues Tab**
- Issues tab shows a list of issues sorted by contributions and activities under an issue.

### 1. Creating an Issue
- "Issue" is a small problem.
- *Example:* A student notices the WiFi in Hall A is down and creates an issue thread.
Students can report campus-related problems, creating an **issue thread**.  

### 2. Adding Contributions & Activities
- Anyone can add a **contribution**—an **event** or **message** (text, image, video).  
- Under a contribution, students can **tag responsible persons** from student bodies or authorities.  
- Contributions can be **upvoted/downvoted** or **replied to**, forming **multi-threaded discussions**.
- Each issue shows a log of contributions to the issue by others, these contributions are used to sort the top issues in the issues tab.
- All **activities** are tracked; more activity **increases the chance of the issue being highlighted**.  
*Example:* Another student replies, “I spoke to the IT office—they are fixing it today,” tagging the IT head. Others upvote this contribution.

### 3. Tracking Progress
- Each issue has a **progress tracker**:  
  `Reported → Assigned → Discussed → Action Taken → Resolved`  
- A **real-time log** combines **all contributions by students**, showing updates, actions, and collective effort.  
*Example:* The log shows the WiFi issue was reported, IT assigned, discussed with residents, action taken, and resolved.
 

### 5. 🔐 **Auth**
- All users must be verified via their student email or ID card.  
- Harassment for opinions on the platform is strictly prohibited, and legal action can be taken against offenders.  
- Session management for both web and mobile.

### 6. 🎬 **Campus Highlights**
- Campus highlighted moments as short videos.  
- Trending/latest feed with video playback.  
- Mobile app handles video compression and playback.

### 7. 🗳️ **Democracy Practice**
- Management of the platform for a campus will be done by the developer team and **elected bodies**.  
- Platform decisions or changes can also be decided **via voting directly on the platform**.  
- Includes roles, permissions, and voting mechanisms for campus governance. Like, a club or organization has permissions to create a crowdfunding/donation event. Elected body will have permission to moderate the contents in the platform. 

### 8. 🛒 **Kroy-Bikroy (Buy-Sell)**
- A campus marketplace where students can post items for sale.  
- Users can upload **single or multiple items** with pictures and videos.  
- Buyers can browse, comment, and contact sellers.  
- Items can be categorized for easier browsing (electronics, books, clothes, etc.).

### 9. 💝 **Crowdfunding/Donation** 
- Any student organization, club, or authorized student body can create a crowdfunding event.  
- Each event gets a **shareable link** and is showcased in the crowdfunding section.  
- Other students or alumni of the university can **donate instantly** using online payment gateways like **bKash**.  
- Events display fundraising goals, progress tracking, updates, and transparent usage of funds.




---

## 📁 PROJECT STRUCTURE (Monorepo)

```
daabi-project/
├── 🌐 web/                    # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # Utilities and stores
│   ├── public/            # Static assets
│   └── package.json
├── 📱 mobile/                 # React Native app
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── components/    # Reusable mobile components
│   │   └── api/           # API calls
│   └── package.json
├── ⚙️ backend/                # Empty for now
├── 🔗 shared/                 # Shared utils/types (optional)
└── 📄 README.md
```

---

## 🔄 GIT WORKFLOW

- **main** → production-ready
- **develop** → integration of all features  
- **feature/<feature-name>** → individual feature branches
- **Semantic versioning:** v1.0.0, v1.1.0, etc.

---

