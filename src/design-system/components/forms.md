# Forms

Each field block should include:
- Label
- Input control
- Optional description/help text
- Error message

States:
- Default
- Focus (ring with primary color)
- Error (`destructive`)
- Disabled (reduced contrast)

Validation:
- Frontend UX via Zod + React Hook Form.
- Backend remains source of truth.
