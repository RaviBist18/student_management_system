# Ambition Technical Institute Student Showcase

## Overview
Build a polished operator-facing student records prototype that launches with all four supplied student profiles and supports parent presentation workflows entirely in browser state.

## What will be built
- A high-contrast dashboard with institute branding, operator status, live search, working course/batch/performance filters, and summary counters.
- Responsive student cards with score and attendance indicators; selecting a card opens that student's complete presentation view.
- A parent presentation view with identity and guardian details, animated score and attendance meters, weekly/monthly/attendance tabs, remarks, and back navigation.
- A shared add/edit student dialog that validates inputs and immediately creates or updates records without reloading.
- Working light/dark theme control, CSV file picker feedback, print-ready PDF flow, and downloadable Excel-compatible student report.
- Projector-friendly responsive styling using the specified navy, indigo, purple, emerald, amber, and coral palette.

## Technical details
- React local state holds all records, filters, selected student, modal state, active tab, and theme.
- Export PDF uses the browser print dialog with dedicated print styling; Excel export downloads a CSV-compatible spreadsheet file.
- Attendance history is generated deterministically from each student's attendance percentage for a stable visual demo.
- The home route receives complete institute-specific metadata for search and sharing.
- Plus Jakarta Sans is loaded from the document head; icons come from the existing icon package where available.

## Validation
- Verify the dashboard at desktop and mobile widths.
- Exercise search, every filter, profile navigation, all tabs, add/edit save, theme toggle, and export controls.
- Confirm there are no browser errors and that text and controls do not overlap.
