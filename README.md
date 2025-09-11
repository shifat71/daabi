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
- User can create various events (like in Facebook) under a demand to raise support for it.

### 4. 🔧 **Issues**
- Students can create issues they are facing.  
- Each issue has a **dynamic progress tracker** showing the status of resolution.  
- A log-based system records updates, actions taken, and comments.  
- Students can view progress and logs in real-time.

### 5. 🔐 **Auth**
- All users must be verified via their student email or ID card.  
- Harassment for opinions on the platform is strictly prohibited, and legal action can be taken against offenders.  
- Session management for both web and mobile.

### 6. 🎬 **Shorts**
- Campus moments as short videos (like reels).  
- Trending/latest feed with video playback.  
- Mobile app handles video compression and playback.

### 7. 🗳️ **Democracy Practice**
- Management of the platform for a campus will be done by **elected bodies**.  
- Platform decisions or changes can also be decided **via voting directly on the platform**.  
- Includes roles, permissions, and voting mechanisms for campus governance.

### 8. 🛒 **Kroy-Bikroy (Buy-Sell)**
- A campus marketplace where students can post items for sale.  
- Users can upload **single or multiple items** with pictures and videos.  
- Buyers can browse, comment, and contact sellers.  
- Items can be categorized for easier browsing (electronics, books, clothes, etc.).

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

