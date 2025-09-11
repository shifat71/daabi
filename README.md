Project Name: Daabi
Project Type: Student platform for raising demands, discussions, and sharing campus moments.

Goal: Build Daabi iteratively, starting with MVP and expanding features over time, for both web (Next.js Page Router) and mobile (React Native). Backend folder exists but remains empty for now.

---

FEATURES:
The platform has the following features:

1. **Feed**:  
   - A Facebook-like feed where students can see posts, discussions, top demands, posts, videos, pictures and campus news. Users can also interact with the items in the feed like facebook.

2. **Discussion**:  
   - A Reddit-style discussion section with multi-thread commenting feature.  
   - Top discussions are sorted by upvotes/downvotes, popularity, and engagement.  
   - Users can create new discussions, comment, and interact.

3. **Demands**:  
   - Students can create demands or requests for the authorities.  
   - Top demands are sorted by agreement, popularity, and category (department, club, hall, environment).  
   - Users can vote in agreement or disagreement to the demand.

4. **Issues**:  
   - Students can create issues they are facing.  
   - Each issue has a **dynamic progress tracker** showing the status of resolution.  
   - A log-based system records updates, actions taken, and comments.  
   - Students can view progress and logs in real-time.

5. **Auth**:  
   - User registration and login (dummy placeholders for now).  
   - All users must be **verified by their student email or manually through student ID card**.  
   - Session management for web & mobile.

6. **Shorts**:  
   - Campus moments as short videos (like reels).  
   - Trending/latest feed with video playback.  
   - Mobile app handles video compression and playback.   

---

PROJECT STRUCTURE (Monorepo):

daabi-project/
├── web/        # Next.js frontend
│   ├── pages/  # Routes
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
├── mobile/     # React Native app
│   ├── src/screens/
│   ├── src/components/
│   └── src/api/
├── backend/    # Empty for now
├── shared/     # Shared utils/types (optional)
└── README.md

---

GIT WORKFLOW:
- main → production-ready
- develop → integration of all features
- feature/<feature-name> → individual feature branches
- Semantic versioning: v1.0.0, v1.1.0, etc.

---

