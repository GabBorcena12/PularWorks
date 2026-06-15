# PULAR Website

Company profile and services showcase website for **Pular Electrical Services and Supply**.

The site presents PULAR's electrical services, transformer products, project proof, contact details, and business information with a responsive industrial-themed design.

## Project Structure

- `PularProject/` - Blazor web application source.
- `PularProject/Components/Pages/Home.razor` - Main website content.
- `PularProject/wwwroot/app.css` - Main site styling.
- `PularProject/wwwroot/site.js` - Frontend interactions and animations.
- `PularProject/wwwroot/images/` - Blazor image assets.
- `docs/` - Static GitHub Pages version of the website.
- `tools/serve-docs.cjs` - Small local server for previewing the `docs` site.

## Important Editing Note

This repository keeps two versions of the same website:

1. The Blazor app in `PularProject/`
2. The static GitHub Pages export in `docs/`

When changing visible website content, styles, scripts, or images, update both versions so the local Blazor app and the published GitHub Pages site stay aligned.

Common matching files:

- `PularProject/Components/Pages/Home.razor` and `docs/index.html`
- `PularProject/wwwroot/app.css` and `docs/app.css`
- `PularProject/wwwroot/site.js` and `docs/site.js`
- `PularProject/wwwroot/images/` and `docs/images/`

## Run the Blazor App

```powershell
dotnet run --project PularProject\PularProject.csproj
```

Then open the local URL shown in the terminal.

## Build

```powershell
dotnet build PularProject.slnx -v:minimal
```

If the build fails because `PularProject.exe` is being used by another process, stop the running app first:

```powershell
Get-Process PularProject -ErrorAction SilentlyContinue | Stop-Process -Force
dotnet build PularProject.slnx -v:minimal
```

## Preview the GitHub Pages Version

```powershell
node tools\serve-docs.cjs
```

Then open:

```text
http://127.0.0.1:5099
```

## GitHub Pages Setup

Configure GitHub Pages with:

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/docs`

## Current Website Features

- Responsive hero section with PULAR branding.
- Services / Products Offered cards.
- Transformer supply showcase.
- Project Proof cards with Facebook links.
- About PULAR and trust/stat sections.
- Floating contact widget.
- Contact buttons for phone, email, and Facebook.
- Static `docs` version ready for GitHub Pages.
