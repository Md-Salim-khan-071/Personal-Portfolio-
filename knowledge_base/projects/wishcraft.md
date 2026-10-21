# WishCraft

## Project Overview

WishCraft is a web-based Birthday Page Generator that allows users to create personalized digital birthday greetings. Users can enter birthday details, upload photos, customize the appearance, select themes and background music, and generate a unique shareable link. It is designed for people who want to send creative, personalized birthday wishes online.

## Problem Statement

Traditional birthday wishes through text messages and static images offer limited personalization and interactivity. WishCraft addresses this by allowing users to create customized birthday webpages that recipients can access through a public link.

## Goals

- Build an interactive and responsive birthday page creation experience.
- Store birthday details and uploaded images using Supabase.
- Generate unique, shareable birthday pages accessible through a public URL.

## Technology Stack

- **Frontend:** React
- **Build tool:** Vite
- **Backend / platform:** Supabase
- **Database:** Supabase PostgreSQL
- **Authentication:** No application-level user authentication implemented; birthday pages are accessed through unique URLs.
- **Other tools/libraries:** React Router, CSS, Supabase JavaScript client, Git, GitHub
- **Deployment:** Vercel

## Key Features

- Create personalized birthday pages with the recipient's name, age, sender's name, and custom message.
- Upload birthday photos to Supabase Storage.
- Customize image position, zoom, rotation, and frame shape.
- Select birthday themes and background music.
- Generate unique birthday page URLs using database record IDs.
- Copy and share birthday links with other users.
- Display saved birthday details on dynamically generated pages.
- Support direct access to shared birthday pages through Vercel SPA routing.

## User Journey

1. The user visits the landing page and navigates to the birthday page generator.
2. The user enters birthday details, uploads a photo, customizes the design, and generates the page.
3. WishCraft saves the information in Supabase and provides a unique URL that can be copied and shared.

## Main Pages and Components

### Page or Component 1: Home Page

- **Purpose:** Introduce WishCraft and encourage users to create personalized birthday pages.
- **Important behavior:** Displays the landing page, template previews, informational sections, and navigation to the generator.

### Page or Component 2: Birthday Page Generator

- **Purpose:** Collect birthday information and allow users to customize the greeting.
- **Important behavior:** Handles form input, image upload and positioning, theme selection, music selection, and saving the birthday card.

### Page or Component 3: Shared Birthday Page

- **Purpose:** Display the completed birthday greeting to recipients.
- **Important behavior:** Retrieves birthday data using the URL ID and renders the saved message, image, theme, and music configuration. Editing and creator-specific controls should remain separate from the recipient experience.

## Data Model

- **Main tables:** `birthday_cards`
- **Relationships:** The application stores each birthday card as an independent database record. Uploaded images are stored separately in Supabase Storage, with their URLs referenced by the corresponding card record.
- **Important constraints:** Each card has a UUID primary key. The record stores birthday details, image customization settings, selected music, selected template, creation timestamp, and public visibility.

### `birthday_cards` fields

- `id` — UUID primary key
- `birthday_name` — Birthday recipient's name
- `age` — Recipient's age
- `sender_name` — Name of the person sending the greeting
- `message` — Personalized birthday message
- `image_url` — Uploaded image URL
- `image_position_x` — Horizontal image position
- `image_position_y` — Vertical image position
- `zoom` — Image zoom level
- `rotation` — Image rotation
- `frame_shape` — Selected image frame shape
- `selected_music` — Selected music option
- `card_template` — Selected birthday template
- `created_at` — Record creation timestamp
- `is_public` — Public visibility flag

## Supabase Integration

WishCraft uses Supabase for:

- **PostgreSQL Database:** Stores birthday-card information and customization settings.
- **Supabase Storage:** Stores uploaded birthday images in the `birthday-images` bucket.
- **JavaScript Client:** Connects the React frontend to Supabase for inserting and retrieving records.

Supabase Authentication and Edge Functions are not part of the documented implementation.

## Architecture and Data Flow

1. The React frontend collects birthday details and the user's customization choices.
2. The uploaded image is sent to Supabase Storage, and its URL is obtained.
3. The application inserts the birthday-card details and image URL into the `birthday_cards` table.
4. The generated record ID is used to create a unique birthday URL.
5. When a recipient opens `/birthday/:id`, React Router loads the shared birthday page, which retrieves the corresponding record from Supabase and displays it.

## State Management

React component state is used to manage form inputs, selected themes, image customization settings, music selection, and UI interactions. React Router handles navigation and dynamic birthday page routes. No separate global state management library is documented.

## Validation and Error Handling

- Form inputs are used to collect the birthday information required to create a card.
- The application handles image uploads and database insertion through Supabase.
- The shared birthday page retrieves data using the URL ID.
- Production builds are checked using `npm run build`.

Detailed automated validation coverage, loading-state behavior, and error-handling coverage should be documented after verification of the current source code.

## Security and Access Control

- Supabase credentials are configured through environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- The frontend uses the Supabase public client key, not a service-role key.
- Supabase Row Level Security (RLS) policies were configured for inserting and selecting birthday-card records.
- Public birthday URLs are designed to allow recipients to view shared greetings without requiring a Vercel account.
- Because shared URLs use record IDs, public access and database policies should be reviewed to ensure that only intended records and operations are exposed.

## Responsive Design and Accessibility

The interface uses CSS and responsive layouts to support different screen sizes. The landing page, generator, and birthday display are intended to work across desktop and mobile browsers. Further accessibility checks, including keyboard navigation, semantic markup, and screen-reader support, can be documented after testing.

## My Contributions

- Developed the React frontend and reusable page components.
- Implemented the birthday page creation workflow and customization options.
- Integrated Supabase PostgreSQL for birthday-card persistence.
- Integrated Supabase Storage for image uploads.
- Implemented dynamic birthday page routing and shareable links.
- Configured environment variables and deployed the application to Vercel.
- Diagnosed and resolved production deployment issues involving filename case sensitivity and direct navigation to React routes.

## Technical Challenges and Solutions

### Challenge 1: Filename Case Sensitivity During Deployment

- **Challenge:** The application built locally on Windows but failed on Vercel because Linux treats filenames with different capitalization as distinct.
- **Solution:** Corrected the filename and import capitalization, committed the changes to Git, and redeployed the latest GitHub commit.

### Challenge 2: Direct Access to Shared Birthday URLs

- **Challenge:** Opening a generated birthday URL directly returned a Vercel 404 error because the SPA route was not being rewritten to the application entry point.
- **Solution:** Added a `vercel.json` rewrite rule directing application routes to `/index.html`, allowing React Router to resolve the dynamic `/birthday/:id` route.

### Challenge 3: Environment Configuration for Deployment

- **Challenge:** The application needed to connect to Supabase both locally and in production without hard-coded project configuration.
- **Solution:** Used Vite environment variables for the Supabase URL and public client key, with corresponding variables configured in Vercel.

## Testing

- Verified that the application runs locally.
- Verified that the production build completes successfully after correcting filename capitalization.
- Successfully deployed the application to Vercel.
- Verified that generated birthday links can be opened in another browser after configuring SPA routing.
- Further testing of invalid IDs, failed uploads, database access policies, mobile layouts, and automated tests remains advisable.

## Deployment and Usage

- **Live application:** https://wish-craft-lemon.vercel.app/
- **Repository:** https://github.com/Md-Salim-khan-071/WishCraft
- **Environment variables required:**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **How to run locally:**

```bash
git clone https://github.com/Md-Salim-khan-071/WishCraft.git
cd WishCraft
npm install
```

Create a `.env` file in the project root and configure the two environment variables. Then run:

```bash
