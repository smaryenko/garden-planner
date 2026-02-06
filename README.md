# 🫒 Garden Planner App

A modern React Native web app for planning and managing garden layouts with drag-and-drop functionality, built with Expo and Supabase.

## ✨ Features

### 🎨 Garden Management
- Create, edit, and delete gardens with custom backgrounds
- Navigate between gardens with smooth transitions
- Set default values for new trees (sort, year planted, owner)
- Add custom descriptions and locations with Google Maps integration
- Visual garden cards with realistic olive-themed design

### 🌳 Tree & Item Placement
- **Drag & Drop Interface**: Place trees, buildings, and other items on your garden
- **Visual Garden Layout**: See your garden plan with custom background images
- **Item Categories**:
  - Trees (olive, apple, pear, cherry, plum, etc.)
  - Buildings (house, shed, greenhouse, etc.)
  - Other items (pond, path, fence, etc.)
- **Custom Items**: Add custom items with your own images
- **Item Details**: Track type, sort/variety, year planted, owner, and age

### 🔍 Advanced Filtering & Selection
- **Multi-column Filtering**: Filter by type, sort, year, age, owner
- **Checkbox Filters**: Select multiple values per column
- **Visual Highlighting**: Filtered/selected items highlighted, others dimmed (40% opacity, 80% grayscale)
- **Combined Filters**: Filters and selections work together
- **Table View**: Sortable table with all tree details

### 🎯 Interactive Features
- **Zoom & Pan**: 
  - Desktop: Ctrl/Cmd + scroll to zoom, drag to pan when zoomed
  - Mobile: Pinch to zoom, single-finger drag to pan
  - Zoom centers on cursor/touch point for precise control
- **Click to Edit**: Click any item to view/edit details in a popup card
- **Undo System**: Undo add, move, edit, and delete operations
- **Touch Support**: Full mobile touch support for drag & drop

### 👥 Role-Based Access Control
- **Viewer Mode** (default):
  - Browse gardens and view items
  - Select items to see details (read-only)
  - No editing capabilities
  - Expanded garden view (800px)
- **Admin Mode** (login required):
  - Full CRUD operations on gardens and items
  - Drag & drop to place and reposition items
  - Edit item details and custom avatars
  - Access to items panel and all management features

### ⚡ Performance
- **In-memory Caching**: Instant navigation between visited gardens
- **Smart Preloading**: Next/previous gardens preloaded in background
- **Optimized Rendering**: Smooth animations and transitions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Admin Email
EXPO_PUBLIC_ADMIN_EMAIL=your-admin-email@domain.com
```

See `.env.example` for template.

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Get your credentials from Settings > API
3. Run the database schema from `database/schema.sql` in SQL Editor
4. Create an admin user in Authentication > Users

See `SETUP_AUTH.md` for detailed authentication setup.

### 4. Run the App

```bash
# Development
npm start

# Web only
npm run web

# Build for production
npm run build:web
```

## 📦 Deployment

The app is configured for Vercel deployment:

```bash
# Deploy to Vercel
vercel --prod
```

See `DEPLOYMENT.md` for detailed deployment instructions.

## 🏗️ Project Structure

```
├── screens/
│   ├── GardensListScreen.js      # Main screen with garden cards
│   ├── GardenDetailScreen.js     # Detailed garden view
│   ├── EditGardenScreen.js       # Edit garden form
│   ├── AddTreeScreen.js          # Add tree form
│   ├── TreeDetailScreen.js       # Tree details view
│   └── LoginScreen.js            # Admin login
├── components/
│   ├── garden/
│   │   ├── GardenForm.js         # Garden create/edit form
│   │   ├── GardenHeader.js       # Garden title and actions
│   │   ├── ItemsPanel.js         # Draggable items panel
│   │   ├── TreeEditCard.js       # Item edit popup card
│   │   └── TreesTable.js         # Filterable trees table
│   └── modals/
│       ├── AvatarModal.js        # Custom avatar editor
│       ├── DefaultsModal.js      # Garden defaults editor
│       └── DeleteConfirmModal.js # Delete confirmation
├── hooks/
│   ├── useGardens.js             # Garden CRUD operations
│   ├── useTrees.js               # Tree/item CRUD with caching
│   ├── useUndo.js                # Undo functionality
│   └── useTableFilters.js        # Table filtering logic
├── contexts/
│   └── AuthContext.js            # Authentication state
├── constants/
│   └── itemCategories.js         # Item types and icons
├── styles/
│   └── *.styles.js               # Component styles
├── lib/
│   └── supabase.js               # Supabase client
└── database/
    └── schema.sql                # Database schema
```

## 🗄️ Database Schema

### Gardens Table
- `id` (UUID, primary key)
- `name` (text, required)
- `description` (text)
- `location` (text) - supports coordinates or addresses
- `background_image` (text) - URL to background image
- `default_sort`, `default_year_planted`, `default_owner` (default values)
- `created_at`, `updated_at` (timestamps)

### Trees Table
- `id` (UUID, primary key)
- `garden_id` (UUID, foreign key)
- `type` (text) - tree type (olive, apple, etc.)
- `sort` (text) - variety/cultivar
- `year_planted` (integer)
- `owner` (text)
- `x`, `y` (numeric) - position on garden (percentage)
- `custom_avatar` (text) - custom image URL
- `created_at`, `updated_at` (timestamps)

### Items Table
- `id` (UUID, primary key)
- `garden_id` (UUID, foreign key)
- `category` (text) - 'building' or 'other'
- `type` (text) - item type
- `x`, `y` (numeric) - position on garden (percentage)
- `custom_avatar` (text) - custom image URL
- `created_at`, `updated_at` (timestamps)

## 🎨 Design

- **Color Scheme**: Muted olive tones (#556b2f) with light backgrounds (#fafafa)
- **Typography**: Light weight (300-500) for modern, clean look
- **Borders**: Subtle rounded corners (4-8px)
- **Shadows**: Minimal, soft shadows for depth
- **Icons**: Emoji-based for cross-platform consistency
- **Favicon**: Olive emoji (🫒)

## 🔐 Security

- Environment variables for all credentials
- Row Level Security (RLS) enabled on database
- Supabase authentication for admin access
- `.env` file excluded from Git

See `SECURITY_FIX.md` for security best practices.

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🛠️ Tech Stack

- **Frontend**: React Native Web, Expo
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **State Management**: React Hooks & Context
- **Styling**: React Native StyleSheet

## 📄 License

Private project

## 🤝 Contributing

This is a private project. For questions or issues, contact the repository owner.
