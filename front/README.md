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
* Login for users (Github, google, credentials) Oauth ✅
* Restrict scanned repositoriesRe, limit 5 repositories by user ✅
* If a repository does not belong to a user, it will be deleted at the end of the day
* Home Page, show analyzed repositories as cards
* Animation panelInformation
* Different colors by folders to nodes
* Icons by folder
* Show a error message in the UI indicate that the data is not found

### Optional
* Logged in users have 20 free requests to the AI
