# Star Matric Hr Sec School - Grand Reunion 2026 Website

A production-ready website created for **Star Matric Hr Sec School - Grand Reunion Celebration**.

- **School**: Star Matric Hr Sec School
- **Event Date**: Sunday, 27 December 2026
- **Event Time**: 10:00 AM to 2:00 PM (IST)
- **Venues in Poll**: Dindigul Vellu Biriyani Gardens vs Habbebi (with admin locking)
- **Official WhatsApp Group**: [Join Group](https://chat.whatsapp.com/CyygKVWEBhRJ4qBMmyq7IM?s=sw&p=a&iam=2)

---

## 🌟 Key Features

1. **3D Opening Scene**
   - 3D school building facade with classical pillars and overhead arch.
   - Interactive iron gates that swing open as you tap or scroll.
   - Warm sunset sky with golden lighting, floating fireflies, and 3D hearts.
   - Parallax camera depth responding to mouse movement and mobile gyroscope tilt.
   - Tap-anywhere confetti and heart burst particle effects.
   - Soft ambient music (synthesized via Web Audio API, muted by default with toggle) and "Enter the Reunion" / "Skip" controls.

2. **Hero Section & Live 3D Memory Hearts**
   - Glossy 3D floating hearts in space.
   - Tap or hover any heart to spin it toward the camera and flip open into a 3D photo frame with school memories and captions ("Remember this day?").
   - Live counter: `[X] classmates have registered` with milestone celebrations at 25, 50, and 100.
   - 3D rotating memory-wall gallery with drag/swipe rotation and lightbox viewer.

3. **Countdown with "Hearts Left"**
   - Live countdown to 27 December 2026, 10:00 AM (IST) with 3D glowing flip-cards.
   - Interactive row of 3D hearts tracking remaining days. Tap to pop with confetti!
   - Reunion day trigger: Fireworks and *"Today is the day!"* message.
   - Add to Google Calendar direct link + Apple/Outlook `.ics` download.

4. **RSVP Registration & Celebration**
   - Single-screen registration form with fixed event details (School, Date, Time, Venue).
   - Duplicate phone number prevention and validation.
   - Success Celebration: Confetti explosion and 3D flying golden ticket admission pass!
   - Direct action buttons on success screen:
     - Join WhatsApp group
     - Share with friends on WhatsApp (Web Share API with wa.me fallback)
     - Add to Calendar
     - Prompts leading to Biryani Choice, Bench Claim, Selfie Frame, and Message Wall.

5. **WhatsApp Group QR Section**
   - High-contrast QR code generated in code via `qrcode.react`.
   - "Join Group" and "Copy Link" buttons with instant feedback toast.

6. **Vote Poll Section**
   - Venue Poll: *Dindigul Vellu Biriyani Gardens* vs *Habbebi*.
   - Interactive maps and "Get Directions" buttons for both venues.
   - Admin "Lock Winning Venue" functionality: once locked, the site automatically updates to show only the winning venue everywhere.
   - Extra polls for Dress Code and Activities.

7. **Food Preference Counter (Biryani Poll)**
   - Veg vs Non-Veg selection with spice level (Mild, Medium, Spicy) and dietary notes.
   - Tamil action line: *"Biryani waiting!"* (பிரியாணி வெயிட்டிங்!).
   - Live animated steaming biryani pot counter tracking total plates and guest meals.

8. **Classroom Bench Map (3D / Interactive)**
   - 3D classroom scene with blackboard, windows, teacher's desk, and rows of numbered benches (1 to 36).
   - Classmates tap an empty bench to claim: *"My old bench!"* with custom nostalgic taglines.
   - Bench lights up and displays floating name tag.
   - Filters: "Front benchers", "Middle benchers", and "Last benchers" counters.
   - Accessible list view available.

9. **Reunion Selfie Frame Photo Booth**
   - Upload selfie or capture in-browser.
   - 4 custom borders: Official Crest, Chalkboard Nostalgia, Notebook Doodles, Golden VIP.
   - Pan, zoom, and rotate controls on HTML5 Canvas.
   - Sized for Instagram Square (1:1) and WhatsApp Status Portrait (9:16).
   - 100% private in browser with optional opt-in to post to Reunion Wall.

10. **Live Message Wall (Sticky Notes)**
    - School notebook corkboard with colorful sticky notes (yellow, pink, cyan, lime, orange, purple).
    - Rate limiting (one note per 2 minutes) and basic profanity filter.
    - Admin moderation to hide or delete notes.

11. **Fill the Bell Mini-Game**
    - Realistic swinging school bell physics.
    - Timing tap game when the clapper strikes the rim.
    - *"Bell adichaachu, odu!"* (பெல் அடிச்சாச்சு, ஓடு!) sprint celebration across the screen on high combos!
    - Leaderboard and "Bell Master" badge unlock.
    - Low-end 2D mode toggle.

12. **Admin Portal (`/#admin`)**
    - Clean 2D dashboard protected by password (default PIN: `star2026`).
    - Attendee search, filter, and one-click CSV export.
    - Catering food order breakdown with CSV export.
    - Lock winning venue toggle.
    - Message wall moderation (hide/delete).
    - Game leaderboard reset.

13. **Tamil Fun Lines & Bilingual Support**
    - English and Tamil (தமிழ்) toggle in the navbar.
    - Colloquial Tamil lines: *"Biryani waiting!"*, *"மீண்டும் சந்திப்போம்!"*, *"Bench-ku vaanga!"*, *"Bell adichaachu, odu!"*, *"Register pannunga, kalakkalam!"*.

14. **Custom Heart Cursor Trail & Easter Eggs**
    - Floating heart cursor trail on desktop.
    - Floating interactive school bell Easter egg on bottom right (rings and bursts confetti).

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom chalkboard and glassmorphism textures
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Animation**: Framer Motion & Canvas Confetti
- **QR Code**: `qrcode.react`
- **Icons**: Lucide React
- **Audio**: Web Audio API Synthesizer (Zero external audio file dependencies)
- **Database**: Supabase (with automatic local-storage fallback for immediate offline preview)

---

## 🚀 Getting Started

### 1. Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 2. Customizing Event & Batch Details

Edit `src/config/reunionConfig.ts` to update:
- `batchYear`: e.g. `"2016"`
- `batchName`: e.g. `"Class of 2016 - The Trailblazers"`
- `organizerName`: e.g. `"Your Name & Reunion Committee"`
- `defaultMemoryPhotos`: replace URLs and captions with your batch group photos.

### 3. Supabase Setup (Optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor and run the script located at `supabase/schema.sql`.
3. Copy your project URL and anon public key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Restart your dev server. The app will now sync live across all visitors with PostgreSQL Row-Level Security!

---

## 📦 Deploying to Production

### Deploy on Vercel:
1. Push this repository to GitHub.
2. In [vercel.com](https://vercel.com), import the repository.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add environment variables if using Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
7. Click **Deploy**!

### Deploy on Netlify:
1. Connect repository in [netlify.com](https://netlify.com).
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Click **Deploy Site**!

---

## 🔐 Admin Access

- Access the Admin Portal by clicking the small shield icon in the top navbar or footer, or navigate directly to `/#admin`.
- Default Admin PIN: `star2026` (can be customized in `src/components/admin/AdminDashboard.tsx`).
