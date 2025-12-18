# Design House Repository Overview

**Last Updated:** 2025-12-17

## Executive Summary

| Repository | Stack | Version | Purpose | Status |
|------------|-------|---------|---------|--------|
| design-system | Angular 18.2.9 | v7.12.2 | Core UI component library | Active |
| themes | Angular 18.2.9 + Nx | v0.0.0 | Multi-tenant theming | Active |
| DigitalCircular2 | Angular 18.2.9 | v0.0.0 | Consumer circular app | Active |
| ideal-sale-circular | Angular 17.3.12 | v0.0.0 | Admin circular app | Needs Upgrade |
| Ideal-Sale-API-V2 | PHP/Laravel | - | Backend API | Active |
| media-repository | Python/Serverless | - | Media handling | Active |
| media-repo-search | Node.js/Lambda | v1.0.0 | Search service | Active |
| mydarndest-playground | HTML/CSS/JS | - | Prototypes | Migration Candidate |

---

## Dependency Graph

```
@thedesignhouse/design-system (v7.12.x)
         │
         ├──────────────────┐
         ▼                  ▼
      themes           DigitalCircular2
    (Nx monorepo)      (Consumer app)
         │
         ▼
    80+ tenant themes
```

---

## Detailed Repository Information

### 1. design-system

**Path:** `/Users/billklingensmith/Code/design-system`

| Property | Value |
|----------|-------|
| Package Name | @thedesignhouse/design-system |
| Version | 7.12.2 |
| Angular | 18.2.9 |
| Angular Material | 18.2.10 |
| TypeScript | ~5.4.5 |
| Build Tool | ng-packagr |
| Documentation | Storybook 8.3.6 |

**Purpose:** Core set of UI components and design tokens used across all frontend applications.

**Key Features:**
- Style Dictionary for design token generation
- Angular components with Storybook documentation
- Published to GitHub npm registry
- Chromatic for visual regression testing

---

### 2. themes

**Path:** `/Users/billklingensmith/Code/themes`

| Property | Value |
|----------|-------|
| Package Name | @thedesignhouse/themes |
| Angular | 18.2.9 |
| Nx | 20.0.6 |
| TypeScript | 5.5.4 |

**Purpose:** Nx monorepo containing 80+ tenant-specific themes.

**Key Features:**
- Nx workspace for managing multiple theme projects
- SCSS-based theming with hot-reload development
- Consumes @thedesignhouse/design-system
- Local CDN server for development

**Theme Count by Client:**
- Coborn's (cob-*): 4 themes
- AFS (*afs-*): 6 themes
- ACI (*aci-*): 2 themes
- And 70+ more...

---

### 3. DigitalCircular2

**Path:** `/Users/billklingensmith/Code/DigitalCircular2`

| Property | Value |
|----------|-------|
| Package Name | designhouse |
| Angular | 18.2.9 |
| Angular Elements | 19.1.3 |
| Angular Material | 18.2.10 |
| NgRx | 18.1.0 |
| TypeScript | 5.5.4 |

**Purpose:** Consumer-facing digital circular application.

**Key Features:**
- Server-Side Rendering (SSR)
- Angular Elements for web component embedding
- Firebase integration
- Storybook documentation
- Serverless deployment

---

### 4. ideal-sale-circular

**Path:** `/Users/billklingensmith/Code/ideal-sale-circular`

| Property | Value |
|----------|-------|
| Package Name | ideal-sale-circular |
| Angular | 17.3.12 |
| PrimeNG | 17.18.15 |
| Angular Material | 17.3.10 |
| NgRx | 17.2.0 |
| TypeScript | 5.2 |

**Purpose:** Admin application for managing circulars and promotions.

**Key Features:**
- Server-Side Rendering (SSR)
- PrimeNG UI components
- Firebase integration
- Serverless deployment

**Status:** ⚠️ Needs upgrade from Angular 17 to 18 for alignment with other projects.

---

### 5. Ideal-Sale-API-V2

**Path:** `/Users/billklingensmith/Code/Ideal-Sale-API-V2`

| Property | Value |
|----------|-------|
| Framework | Laravel (PHP) |
| Build Tool | Laravel Mix / Webpack |
| Deployment | Serverless Framework |

**Purpose:** Backend API providing data services for all frontend applications.

**Key Features:**
- Docker-based local development
- Firebase integration
- Serverless deployment to AWS
- Multiple environment configurations

---

### 6. media-repository

**Path:** `/Users/billklingensmith/Code/media-repository`

| Property | Value |
|----------|-------|
| Language | Python |
| Deployment | Serverless Framework |

**Purpose:** Media asset management and storage service.

---

### 7. media-repo-search

**Path:** `/Users/billklingensmith/Code/media-repo-search`

| Property | Value |
|----------|-------|
| Language | Node.js |
| AWS SDK | 3.893.0 |

**Purpose:** Lambda-based search service for media repository.

---

### 8. mydarndest-playground

**Path:** `/Users/billklingensmith/Code/mydarndest-playground`

| Property | Value |
|----------|-------|
| Stack | HTML/CSS/JavaScript |
| Status | Prototype / Migration Candidate |

**Purpose:** Prototypes and experiments including:
- Analytics Dashboard (~70 HTML files)
- Style Guide
- Card Concepts

**Migration Status:** Candidate for Angular migration using design-system components.

---

## Version Alignment

| Dependency | design-system | themes | DigitalCircular2 | ideal-sale-circular |
|------------|---------------|--------|------------------|---------------------|
| Angular | 18.2.9 | 18.2.9 | 18.2.9 | **17.3.12** |
| Angular Material | 18.2.10 | 18.2.10 | 18.2.10 | 17.3.10 |
| TypeScript | ~5.4.5 | 5.5.4 | 5.5.4 | 5.2 |
| RxJS | 7.4.0 | 7.4.0 | 7.4.0 | 7.8.0 |
| Zone.js | ~0.14.10 | 0.14.10 | 0.14.10 | ~0.14.10 |

---

## Recommendations

1. **Upgrade ideal-sale-circular** from Angular 17.3 to 18.2 for consistency
2. **Migrate analytics-dashboard** from HTML/CSS/JS to Angular
3. **Standardize TypeScript** version across all projects (recommend 5.5.x)
4. **Consider adding PrimeNG** to design-system for shared component library

---

## Running This Review

To regenerate this documentation, use the Claude Code slash command:

```
/review-repos
```

For a quick version check:

```
/check-versions
```
