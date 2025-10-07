# 🚀 aggroNATION - The Ultimate AI News Aggregation Platform

A powerful AI-focused content aggregation platform built with **Next.js**, **TypeScript**, **MongoDB**, and **Tailwind CSS**. Discover and explore the latest AI news, research papers, Twitter discussions, and YouTube content from 50+ curated sources, all in one intelligent interface.

![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🎯 **Mission: Becoming the Best AI News Source on the Internet**

AggroNATION aggregates and curates AI content from **50+ premium sources** including:
- 🐦 **35+ AI Twitter accounts** (OpenAI, DeepMind, Anthropic, top researchers)
- 📰 **15+ RSS feeds** (Wired AI, HackerNoon, Hugging Face Blog, arXiv)
- 🎥 **10+ YouTube channels** (Two Minute Papers, Yannic Kilcher, AI Explained)
- 🐙 **GitHub AI repositories** with intelligent scoring
- 📊 **Real-time trending detection** and breaking news alerts

## ✨ **Advanced Features**

### 🔥 **AI-Powered Content Intelligence**
- **Breaking News Detection** - Identify major AI developments within minutes
- **Content Impact Scoring** - AI-calculated importance rankings (1-100)
- **Duplicate Detection** - Merge similar articles from multiple sources
- **Expert Mention Tracking** - Monitor when industry leaders discuss topics
- **Trending Velocity Analysis** - Track how fast stories spread

### 🎯 **Multi-Modal Aggregation**
- **Articles** - RSS feeds from top AI publications
- **Videos** - YouTube integration with AI/ML channels
- **Tweets** - Real-time Twitter/X monitoring with profile image fallbacks
- **Research Papers** - arXiv AI papers with citation tracking
- **GitHub Repos** - AI/ML repositories with activity scoring
- **AI Models** - Hugging Face model tracking and updates

### 🏆 **Community & Engagement**
- **Expert Verification** - Verified badges for AI researchers/practitioners
- **Discussion Threading** - Structured technical discussions
- **Prediction Markets** - Community predictions on AI developments
- **Bookmarking System** - Save important content
- **Comment System** - Threaded discussions with moderation

### 🚀 **Performance & Intelligence**
- **Real-time Sync** - Content updates every 30 minutes
- **Smart Caching** - Optimized for speed and performance
- **Mobile-First Design** - Responsive across all devices
- **Dark Mode** - Beautiful theme switching
- **SEO Optimized** - Proper meta tags and structured data

## 🛠️ **Tech Stack**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **Real-time Updates**: Automated content synchronization
- **AI Integration**: Content intelligence and scoring algorithms
- **Social APIs**: Twitter/X, YouTube, GitHub integration

## 🎯 **Content Sources**

### 🐦 **Twitter/X Accounts (35+)**
**AI Leaders & Researchers:**
- Andrej Karpathy (1.2M followers) - ex-Tesla/OpenAI
- Lex Fridman (2.5M followers) - MIT researcher, podcaster
- Andrew Ng (800K followers) - DeepLearning.ai founder
- Yann LeCun (500K followers) - Meta Chief AI Scientist
- Allie K. Miller (1.5M followers) - AI advisor

**AI Companies:**
- OpenAI (3.5M followers) - ChatGPT, GPT-4
- DeepMind (1.2M followers) - Google's AI research lab
- Anthropic (300K followers) - Claude AI
- Hugging Face (600K followers) - Open-source AI
- xAI (700K followers) - Elon Musk's AI company

### 📰 **RSS Feeds (15+)**
- **Wired AI** - Latest AI news and analysis
- **HackerNoon AI** - Technical AI articles
- **Hugging Face Blog** - Model releases and tutorials
- **The Decoder** - AI industry analysis
- **arXiv AI Papers** - Latest research publications
- **AI News** - Breaking AI developments

### 🎥 **YouTube Channels (10+)**
- **Two Minute Papers** - AI research explanations
- **Yannic Kilcher** - Paper reviews and analysis
- **AI Explained** - Technical deep dives
- **Matt Wolfe** - AI tools and applications
- **Machine Learning Street Talk** - Expert discussions

## 🚀 **Quick Start**

### 1. Clone the Repository
```bash
git clone https://github.com/fame0528/aggroNATION-ai-news.git
cd aggroNATION-ai-news
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file:
```env
# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Admin Access
ADMIN_PASSWORD=your-admin-password

# Social APIs (Optional)
TWITTER_BEARER_TOKEN=your-twitter-api-token
YOUTUBE_API_KEY=your-youtube-api-key
GITHUB_TOKEN=your-github-token
```

### 4. Initialize Database
```bash
node scripts/init-db.js
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 **API Endpoints**

### Content APIs
- `GET /api/articles` - Fetch articles with filtering
- `GET /api/videos` - Fetch YouTube videos
- `GET /api/tweets` - Fetch Twitter/X posts
- `GET /api/models` - Fetch AI models
- `GET /api/articles/search` - Advanced search

### Admin APIs
- `POST /api/admin/sync-content` - Manual content sync
- `GET /api/admin/feeds` - Manage RSS feeds
- `POST /api/admin/x-accounts` - Manage Twitter accounts
- `GET /api/admin/analytics` - Content analytics

### Engagement APIs
- `POST /api/articles/[id]/like` - Like content
- `POST /api/articles/[id]/bookmark` - Bookmark content
- `POST /api/articles/[id]/view` - Track views
- `GET /api/articles/[id]/comments` - Get comments

## 🏗️ **Architecture**

```
aggroNATION/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API endpoints
│   │   ├── admin/          # Admin dashboard
│   │   └── [routes]/       # Public pages
│   ├── components/         # React components
│   ├── models/            # MongoDB schemas
│   ├── lib/               # Utilities
│   ├── utils/             # Helper functions
│   └── types/             # TypeScript definitions
├── scripts/               # Automation scripts
├── public/               # Static assets
└── docs/                 # Documentation
```

## 🎯 **Roadmap to #1 AI News Source**

### **Phase 1: Foundation (Complete)**
- ✅ Multi-source aggregation (RSS, Twitter, YouTube)
- ✅ Real-time content synchronization
- ✅ Community engagement features
- ✅ Mobile-responsive design

### **Phase 2: Intelligence (In Progress)**
- 🔄 AI-powered content scoring
- 🔄 Breaking news detection
- 🔄 Expert verification system
- 🔄 Advanced search and filtering

### **Phase 3: Market Leadership (Planned)**
- 📅 AI funding tracker
- 📅 Research impact analysis
- 📅 Company timeline visualization
- 📅 Policy and regulation tracking

## 🤝 **Contributing**

We welcome contributions! Areas where help is needed:
- 🧠 AI content curation algorithms
- 🎨 UI/UX improvements
- 📊 Analytics and insights
- 🔧 Performance optimizations
- 📝 Documentation and tutorials

## 📄 **License**

This project is licensed under the MIT License.

## 🙏 **Acknowledgments**

- AI research community for incredible innovations
- Open source contributors and maintainers
- Content creators and educators in AI space
- Early users and beta testers

---

**🚀 Built to become the definitive source for AI news and insights**

*Join us in democratizing access to AI knowledge and staying at the forefront of artificial intelligence developments.*