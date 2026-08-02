# Citizen Grievance Portal - Design System Specification (Sprint 1)

This document establishes the official visual and UX guidelines for the Citizen Grievance Portal. It serves as a unified design system that future pages must follow to maintain a professional, minimal, accessible, and trustworthy digital experience.

---

## 1. Product Personality

The Citizen Grievance Portal is a digital bridge between citizens and government authority. The visual design must evoke:
* **Trust & Security**: Utilizing solid grids, official color accents, and structured layouts to signify stability and security.
* **Clarity & Efficiency**: Focusing on low-noise content, eliminating ornamental elements, and putting task completion first.
* **Empathy & Access**: Providing generous touch targets, high-contrast readable text, and supportive messaging.

### Audience Tone
* **For Citizens**: Empathetic, supportive, reassuring, and extremely simple. Actions must require low cognitive load.
* **For Government Officers & Admins**: Task-driven, density-optimized, focused on rapid data processing, filtering, and status updates.

---

## 2. Color Palette & Rationale

We use HSL format space-separated values mapped to Tailwind CSS v4 design variables. This allows the use of opacity modifiers natively (e.g. `bg-primary/20` matches 20% opacity of the brand trust blue).

| Token | Class Variant | Color Code (HSL) | Description | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `bg-primary` | `221.2 83.2% 53.3%` | Deep Trust Blue | Evokes authority and official status; provides 5.6:1 contrast ratio against white surfaces (WCAG AA & AAA compliant). |
| **Secondary** | `bg-secondary` | `210 40% 96.1%` | Cool Slate Gray | Subdued neutral highlight used for structural divisions, headers, and backgrounds. |
| **Success** | `bg-success` | `142.1 76.2% 36.3%` | Emerald Green | Used for resolved, approved, and final states. Distinguishable and professional. |
| **Warning** | `bg-warning` | `37.9 92.1% 50.2%` | Amber Gold | Used for pending action, review, or in-progress states. Visible without creating panic. |
| **Error** | `bg-error` | `346.8 84.1% 61.2%` | Crimson Red | Used for rejected states, form validation errors, and critical system issues. |
| **Background** | `bg-background` | `0 0% 100%` | Solid White | Clear light theme foundation. |
| **Foreground** | `text-foreground`| `222.2 47.4% 11.2%` | Deep Navy/Slate | High-density charcoal tone for primary reading, avoiding pure black. |

---

## 3. Typography

* **Heading Font**: `Outfit` (Modern geometric sans-serif; gives a polished, professional feel to landing titles and header layouts).
* **Body Font**: `Inter` (Neutral, highly readable at micro-scales, optimized for complex data views and forms).

### Type Scale (16px base)
* **Heading 1**: `2.25rem` (36px) | Leading `1.2` | Weight `700` (Bold)
* **Heading 2**: `1.875rem` (30px) | Leading `1.25` | Weight `600` (Semibold)
* **Heading 3**: `1.5rem` (24px) | Leading `1.3` | Weight `600` (Semibold)
* **Heading 4**: `1.25rem` (20px) | Leading `1.35` | Weight `600` (Semibold)
* **Body Base**: `1rem` (16px) | Leading `1.5` | Weight `400` (Regular)
* **Body Small**: `0.875rem` (14px) | Leading `1.45` | Weight `400` / `500` (Medium)
* **Captions**: `0.75rem` (12px) | Leading `1.4` | Weight `400`

---

## 4. Spacing System

Based on a strict 4px grid. We map spacings to Tailwind's default layout multipliers:
* **`space-1` (4px)**: Tight items, icon-to-text spacing.
* **`space-2` (8px)**: Input inner height gap, labels margin.
* **`space-3` (12px)**: Dashboard cell paddings, dense stack spacing.
* **`space-4` (16px)**: Standard gap between cards, inner padding of form modules.
* **`space-6` (24px)**: General Card padding, list block layouts.
* **`space-8` (32px)**: Responsive layout margins, page headers gap.
* **`space-12` (48px)**: Landing section splits, large grid layout spacings.

---

## 5. Border Radius

Rounded values are constrained to preserve a structured, professional appearance:
* **`radius-none` (0px)**: Large blocks, split layouts.
* **`radius-sm` (4px)**: Badges, tag chips, checkboxes.
* **`radius-md` (8px)**: Buttons, inputs, form text fields.
* **`radius-lg` (12px)**: Cards, dropdown containers, modals.
* **`radius-xl` (16px)**: Hero visual containers.
* **`radius-full` (9999px)**: Avatars, status pills (e.g. pending, resolved).

---

## 6. Shadows & Elevation

Shadows are kept soft and minimal to indicate surface depth without cluttering the screen.
* **`shadow-sm`**: `0 1px 2px 0 rgb(0 0 0 / 0.05)` (Default input fields focus indicator).
* **`shadow-md`**: `0 4px 6px -1px rgb(0 0 0 / 0.05)` (Default card elements, interactive lists).
* **`shadow-lg`**: `0 10px 15px -3px rgb(0 0 0 / 0.04)` (Modals, headers, sidebars).

---

## 7. Basic Layout Grid & Containers

* **Citizen Layouts**: Multi-column grids default to `grid-cols-1` on mobile, scaling to `grid-cols-12` on desktop. Page content is centered using a max-width container to increase readability.
* **Officer/Admin Dashboards**: Left-fixed sidebar coupled with a fluid or wide container layout to maximize data grid screen real estate.
* **Grid Gaps**: Mapped consistently using `gap-6` (24px) for cards and `gap-4` (16px) for form inputs.

---

## 8. Responsive Breakpoints

Utilizing standard Tailwind CSS responsive boundaries:
* **Mobile (sm)**: `640px` (All components shift to stacked form structures; Sidebar collapses to slide-over drawer).
* **Tablet (md)**: `768px` (Navigation menu shifts from mobile triggers to flat nav links).
* **Desktop (lg)**: `1024px` (Main structural divisions split into multi-column layout modules).
* **Widescreen (xl/2xl)**: `1280px` / `1536px` (Restricted grid widths to avoid text measure fatigue).

---

## 9. Accessibility Rules (WCAG 2.1 AA & AAA compliance)

* **Contrast Ratios**: Body text must maintain a minimum of `4.5:1` contrast ratio. Brand Primary Indigo has a `5.6:1` contrast against white, passing AA and AAA large text standards.
* **Color as Status Indicator**: Color must never be the only indicator of a state. Form error fields must display red boundaries AND a validation warning message. Badges must combine state colors with appropriate text labels and icons.
* **Keyboard Navigation**: Interactive controls must have clear, high-visibility focus borders (`focus-visible:ring-2 focus-visible:ring-offset-2`).
* **Tap Targets**: Mobile elements and controls must provide a minimum tap target size of `44x44` pixels.
* **Screen Reader Labels**: Icons that convey status must include `aria-hidden="true"` and be supplemented by adjacent descriptive texts, or carry direct `aria-label` tags.

---

## 10. Reusable Components API

All Sprint 1 components are styled using Tailwind CSS v4, class merging utilities (`clsx` + `tailwind-merge`), and dynamic properties configuration via `class-variance-authority` (CVA).

### Component List & File Directory

1. **`cn` class merger** ([utils.js](file:///c:/Users/rajra/Desktop/personal-projects/citizen-grievance-portal/citizen-grievance-frontend/src/lib/utils.js))
   Helper function combining tailwind classes safely.

2. **Container** ([container.jsx](file:///c:/Users/rajra/Desktop/personal-projects/citizen-grievance-portal/citizen-grievance-frontend/src/components/ui/container.jsx))
   * *Props*:
     - `fluid`: boolean (limits or expands width)
     - `size`: `'sm' | 'md' | 'lg' | 'xl'`

3. **Label** ([label.jsx](file:///c:/Users/rajra/Desktop/personal-projects/citizen-grievance-portal/citizen-grievance-frontend/src/components/ui/label.jsx))
   * *Props*:
     - `htmlFor`: string (maps input focus)
     - `required`: boolean (shows asterisk indicator)

4. **Button** ([button.jsx](file:///c:/Users/rajra/Desktop/personal-projects/citizen-grievance-portal/citizen-grievance-frontend/src/components/ui/button.jsx))
   * *Props*:
     - `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'`
     - `size`: `'sm' | 'md' | 'lg' | 'icon'`
     - `disabled`: boolean

5. **Input** ([input.jsx](file:///c:/Users/rajra/Desktop/personal-projects/citizen-grievance-portal/citizen-grievance-frontend/src/components/ui/input.jsx))
   * *Props*:
     - `error`: boolean (triggers red boundary state)
     - `startIcon`: React component (e.g. `Mail` icon)
     - `endIcon`: React component (e.g. `Eye` icon)

6. **Card** ([card.jsx](file:///c:/Users/rajra/Desktop/personal-projects/citizen-grievance-portal/citizen-grievance-frontend/src/components/ui/card.jsx))
   * Composite elements: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
   * Supports `hover` boolean prop to translate upwards.

7. **Navbar** ([navbar.jsx](file:///c:/Users/rajra/Desktop/personal-projects/citizen-grievance-portal/citizen-grievance-frontend/src/components/layout/navbar.jsx))
   * Sticky top header containing brand title, global nav links, user authentication status hooks, and a responsive mobile drawer menu.

8. **Sidebar** ([sidebar.jsx](file:///c:/Users/rajra/Desktop/personal-projects/citizen-grievance-portal/citizen-grievance-frontend/src/components/layout/sidebar.jsx))
   * Collapsible left menu drawer showing active indicators and numeric badges, tailored by role (`'admin' | 'officer'`).

9. **Footer** ([footer.jsx](file:///c:/Users/rajra/Desktop/personal-projects/citizen-grievance-portal/citizen-grievance-frontend/src/components/layout/footer.jsx))
   * Flat dark footer containing government licensing, links, and accessibility compliance notices.
