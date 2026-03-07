# Spec and build

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:
- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification
<!-- chat-id: 84dc93ef-cb8f-40a9-a4bb-06f6e4a7ed27 -->

Assess the task's difficulty, as underestimating it leads to poor outcomes.
- easy: Straightforward implementation, trivial bug fix or feature
- medium: Moderate complexity, some edge cases or caveats to consider
- hard: Complex logic, many caveats, architectural considerations, or high-risk changes

Create a technical specification for the task that is appropriate for the complexity level:
- Review the existing codebase architecture and identify reusable components.
- Define the implementation approach based on established patterns in the project.
- Identify all source code files that will be created or modified.
- Define any necessary data model, API, or interface changes.
- Describe verification steps using the project's test and lint commands.

Save the output to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach
- Source code structure changes
- Data model / API / interface changes
- Verification approach

If the task is complex enough, create a detailed implementation plan based on `{@artifacts_path}/spec.md`:
- Break down the work into concrete tasks (incrementable, testable milestones)
- Each task should reference relevant contracts and include verification steps
- Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function).

Important: unit tests must be part of each implementation task, not separate tasks. Each task should implement the code and its tests together, if relevant.

Save to `{@artifacts_path}/plan.md`. If the feature is trivial and doesn't warrant this breakdown, keep the Implementation step below as is.

---

### [x] Step: Setup and Critical Bug Fixes
<!-- chat-id: 54dc930e-08ca-4c38-b3fc-dcd91235b6e3 -->

Fix critical issues that prevent proper functioning and prepare project assets.

**Tasks**:
- Copy project files from main repository to worktree
- Create or source Alpine F1 car model (`alpine.glb`)
- Add `.gitignore` file with proper patterns
- Create placeholder resume PDF file
- Implement resume download functionality in App.jsx
- Add error boundary component for 3D scene failures
- Test all 6 teams load without errors

**Verification**:
- All teams selectable without console errors
- Alpine team displays 3D model
- Resume downloads when button clicked
- Run `npm run dev` and manually test

---

### [x] Step: CSS Architecture Overhaul
<!-- chat-id: 42d5cf8a-3a31-40ad-b384-0967f0867454 -->

Reorganize and enhance CSS with comprehensive styling system.

**Tasks**:
- Create CSS custom property system (spacing, typography, colors, shadows, transitions)
- Organize CSS into logical sections (base, typography, layout, components, animations, responsive)
- Extract all inline styles from App.jsx to CSS classes
- Implement typography hierarchy with consistent font scales
- Add gradient overlays and glow effects for team colors
- Create utility classes for common patterns

**Verification**:
- No inline styles remain in JSX (except dynamic theme colors)
- Visual appearance matches or improves upon original
- CSS is organized and maintainable
- Run `npm run dev` and verify styling

---

### [x] Step: UI Animations and Transitions
<!-- chat-id: 22a033d3-df68-44ae-98ac-c8d62c185dab -->

Add smooth animations and visual feedback throughout the interface.

**Tasks**:
- Create keyframe animations for:
  - HUD panel entrance (fade-in/slide)
  - Content transitions between teams
  - Button hover/active states
  - Loading spinner
  - Pulse effects for active team
- Implement content fade/slide transitions when switching teams
- Add smooth scroll indicators for overflow content
- Create loading states for 3D model loading
- Add skeleton screens or loading placeholders
- Implement smooth state transitions with CSS transitions

**Verification**:
- All animations play smoothly without jank
- Team switches show smooth transitions
- Loading states visible during initial load
- Test on `npm run dev`

---

### [x] Step: Responsive Design Implementation
<!-- chat-id: 6522a77b-51f1-4467-83e1-5ffa9ff90f7f -->

Make portfolio fully responsive across all device sizes.

**Tasks**:
- Implement mobile-first responsive breakpoints (320px, 768px, 1024px, 1440px)
- Reorganize layout for mobile:
  - Stack HUD panels vertically
  - Collapsible sections
  - Repositioned camera feed
- Make buttons and interactive elements touch-friendly (min 44px)
- Adjust 3D canvas and camera for mobile viewports
- Test navigation bar on small screens
- Ensure text remains readable at all sizes
- Add responsive spacing and typography scales

**Verification**:
- Test on mobile viewport (375px width)
- Test on tablet viewport (768px width)
- Test on desktop (1440px width)
- All content accessible and readable
- No horizontal scroll on mobile
- Use browser dev tools responsive mode

---

### [x] Step: Accessibility and UX Enhancements
<!-- chat-id: 058f35dd-6ec8-437e-9cd5-388c933f861c -->

Improve accessibility and user experience.

**Tasks**:
- Add ARIA labels to all interactive elements
- Implement keyboard navigation for team selector
- Add visible focus indicators for keyboard users
- Verify color contrast ratios (WCAG AA compliance)
- Add `prefers-reduced-motion` support
- Improve visual feedback:
  - Enhanced hover states
  - Active team indicator
  - Cursor changes for interactive elements
- Add scroll indicators for overflowing content
- Improve semantic HTML structure

**Verification**:
- Tab through interface - all interactive elements reachable
- Focus indicators visible
- Test with browser accessibility tools
- Verify contrast ratios pass WCAG AA
- Test with `prefers-reduced-motion: reduce` in browser

---

### [x] Step: 3D Scene Visual Polish
<!-- chat-id: 38506857-5e4f-4b11-8592-ff010177fa4a -->

Enhance the 3D scene with better lighting and effects.

**Tasks**:
- Improve lighting setup:
  - Add rim lights for car silhouette
  - Add colored spotlights based on team
  - Adjust ambient and directional lighting
- Optimize star system performance
- Add particle effects or speed lines during team transitions (optional)
- Enhance shadow quality and positioning
- Fine-tune camera positioning and FOV
- Add subtle environmental effects

**Verification**:
- 3D scene looks more dramatic and polished
- Maintains 60fps on desktop
- No significant performance degradation
- Team color lighting reflects on car
- Test with `npm run dev`

---

### [ ] Step: Code Organization and Cleanup
<!-- chat-id: 7adac690-1320-4ba2-8d0a-287c6b11561a -->

Clean up code structure and remove unused files.

**Tasks**:
- Review and remove or integrate unused component files:
  - `components/UI/Portfolio.jsx`
  - `components/UI/HUD.jsx`
  - `components/UI/Shaders.js`
  - `components/Game/RaceEngine.jsx`
  - `components/Game/Car.jsx`
  - `components/Game/Track.jsx`
- Extract magic numbers to constants
- Add code comments for complex logic
- Ensure consistent code formatting
- Remove console.logs and debug code
- Update imports and dependencies

**Verification**:
- No unused files in project
- Code is clean and well-organized
- No console warnings about unused imports
- Run `npm run build` successfully

---

### [ ] Step: Final Testing and Report
<!-- chat-id: bcc2c218-7916-443e-9f59-7f8ed3440d68 -->

Comprehensive testing and documentation of changes.

**Tasks**:
- Test all functionality:
  - All 6 teams work correctly
  - Hand tracking rotates car
  - All content displays properly
  - Resume downloads
  - Transitions smooth
- Performance testing:
  - Check FPS during transitions
  - Monitor memory usage
  - Verify no memory leaks
- Cross-browser testing (Chrome, Firefox, Safari)
- Create test checklist and verify all items
- Write implementation report to `{@artifacts_path}/report.md`

**Report should include**:
- Summary of all changes made
- Before/after comparisons (describe improvements)
- Testing methodology and results
- Known issues or limitations
- Performance metrics
- Recommendations for future enhancements

**Verification**:
- All test checklist items pass
- Report written and complete
- Project runs without errors
- Build succeeds: `npm run build && npm run preview`
