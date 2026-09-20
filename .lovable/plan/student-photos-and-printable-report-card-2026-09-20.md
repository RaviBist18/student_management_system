# Student Photos and Printable Report Card

## What will change
- Extend each in-memory student record with an optional profile photo.
- Add an image file picker to the existing add/edit form with an immediate preview.
- Show uploaded photos in student cards, the detailed profile, and the printed report; retain initials when no photo exists.
- Keep the existing dashboard, colors, filters, mock records, and on-screen profile layout unchanged.

## Printable report
- Keep the current export button using the browser print dialog.
- Add a print-only white report card containing the institute header and logo placeholder, student and guardian summary, combined weekly and monthly marks table, grades, attendance, remarks, and two signature lines.
- Hide the existing interactive profile while printing so only the formal report card is produced.

## Technical details
- Read selected images as browser data URLs and store them only in React state with the student record.
- Preserve an existing photo when editing unless a replacement is selected.
- Calculate each subject grade from its percentage using the current grading thresholds.

## Validation
- Test image selection, live preview, add/edit save, card/profile photo updates, and initials fallback.
- Verify the print preview contains the complete report card with no clipped or overlapping content.
