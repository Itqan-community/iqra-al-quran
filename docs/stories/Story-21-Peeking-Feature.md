# Story 21: Peeking Feature

## Epic
Epic-2-Recitation-Experience

## User Story
As a memorizer, I want to see just the first word of the next verse when I'm stuck so that I can continue my recitation without seeing more than necessary.

## Acceptance Criteria
- Peeking button available during memorization mode
- Shows only first word of next verse when activated
- Option to reveal entire next verse if still stuck
- Peeked words are highlighted in brown color (per PRD feedback system)
- Edge cases: Handle end of surah gracefully
- Peeking history tracked for progress analysis
- Quick access via gesture or button tap
- Works in offline mode

## Estimate
2 weeks

## Priority
High

## Dependencies
- Recitation modes story (Story-5)
- Feedback system (Story-8)
- Memorization tracking system
- Verse parsing and word extraction
- UI overlay components

## Testing Notes
- Unit tests for word extraction logic
- UI tests for peeking interactions
- Integration tests with memorization mode
- User acceptance tests for memorization workflow
- Performance tests for quick access

## User Impact
Essential memorization aid that provides just enough help to continue recitation without compromising the memorization process, reducing dependence on teachers and friends for "just one word" prompts.

## Risks
- Over-reliance on peeking reducing memorization effort
- UI complexity in memorization mode
- Word boundary detection accuracy in Arabic text

## Notes
Critical feature for memorization mode as mentioned in PRD.
