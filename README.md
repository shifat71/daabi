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

### 3. 📋 **Demands**
- Students can create demands or requests for the authorities.  
- Top demands are sorted by agreement, popularity, and category (department, club, hall, environment).  
- Users can vote in agreement or disagreement to the demand.
- Users can discuss about the demand in multi-thread comment sections like Reddit.
- User can create various events (like in Facebook) under a demand to raise support for it.
- If a demand from authorized body is created, they can raise funds for it using crowdfunding section.

### 4. 🔧 **Issues**  
- Students can raise any campus-related issue (e.g., WiFi outage in a hall, broken facilities, or administrative delays).  
- Once submitted, the issue is forwarded to the **responsible student body or authority** for review and action.  
- Each issue has a **dynamic progress tracker** showing stages:  
  - *Reported → Assigned → Discussed → Action Taken → Resolved*  
- A **real-time log system** records:  
  - Updates, actions, and comments  
  - **Who the issue is assigned to**  
  - Whether the **student body discussed it with authorities**  
  - If it’s **under discussion** or if the **authority has acted**  
- **Student contributions:**  
  - Any student can contribute (e.g., talking with a teacher, gathering support, or taking steps).  
  - Every contribution is **logged and visible**, showing collective effort.  

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

