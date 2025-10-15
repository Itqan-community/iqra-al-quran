# Story 25: Off-Platform Sessions

## Epic
Epic-3-Listening-Goals-Community

## User Story
As a user, I want to log my off-platform recitation sessions so that I can maintain my streaks and accurate progress tracking even when practicing outside the app.

## Acceptance Criteria
- Manual session entry form with date, duration, and surah details
- Session validation to prevent abuse (reasonable time limits)
- Integration with streak calculation and goal progress
- Retroactive entry for past sessions (within reasonable timeframe)
- Edge cases: Handle duplicate session entries gracefully
- Session categories (memorization, review, listening, teaching)
- Notes field for additional session details
- Bulk entry for multiple sessions
- Verification prompts to ensure accuracy

## Estimate
2 weeks

## Priority
Low

## Dependencies
- Goals tracking system (Story-11)
- Streak calculation logic
- Session data storage
- Progress tracking integration
- User authentication system

## Testing Notes
- Unit tests for session validation logic
- Integration tests with streak calculations
- User experience tests for form usability
- Data integrity tests for session storage
- Abuse prevention testing

## User Impact
Maintains engagement and motivation by allowing users to get credit for all their Quran practice, not just in-app sessions, leading to more accurate progress tracking and sustained streaks.

## Risks
- Potential for streak manipulation and cheating
- Data accuracy concerns with manual entry
- User confusion about what qualifies as valid sessions

## Notes
Supports streak maintenance as mentioned in PRD for off-platform activities.
