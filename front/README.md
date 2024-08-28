# Code Map - IA

## Description
Project to map all the files in a GitHub repository to be able to visualize them graphically, see how it is structured and how they relate to each other, also with AI you can get a detailed explanation of each file and what its contribution is to the entire project.

![](/public/hero.webp)

## Getting Started
Run locally
```bash
npm install

npm run dev
```

## Deployed
https://codemap-ia.vercel.app/

## Setup Instructions
If you want a detailed explanation by AI, you can set your ApiKey via the web (not mandatory), you can even analyze your entire repository to get a graphical visualization.

## Know Issues
* Plfw, need to fix:
src/components/Navbar/Navbar.astro
  import ArrowLink from "./IconArrowLink.astro"; ✅

  refer src/components/Footer/IconArrowLink.astro ❌
  refer src/components/Navbar/IconArrowLink.astro ✅

## To do
* Save current position from nodes ✅
* Improve view graphs ✅
* Added tooltip complete path ✅
* Use DB for datas ✅
* With dedicated back, now support astro project ✅
* Login for users (Github, google) Oauth, unlimited analyze repositories
* If User not login, just allow analyze 1 repository
* Animation panelInformation
* Home Page, show analyzed repositories as cards
* Different colors by folders to nodes
* Icons by folder

### Optional
* Logged in users have 20 free requests to the AI
