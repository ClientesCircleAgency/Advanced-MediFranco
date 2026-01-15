# Academy Progress Calculation

> **Purpose**: Document how progress is calculated and how to debug progress issues

---

## Overview

Progress is calculated using a **secure SQL function** (`get_my_course_progress()`) that runs server-side.

**Benefits**:
- ✅ Single source of truth
- ✅ No frontend calculation bugs (5/0, 0/0)
- ✅ Uses `auth.uid()` internally (secure)
- ✅ Efficient (1 query for all courses)

---

## SQL Function

### `get_my_course_progress()`

```sql
SELECT * FROM get_my_course_progress();
```

**Returns**:
| Column | Type | Description |
|--------|------|-------------|
| `course_id` | UUID | Course ID |
| `course_title` | TEXT | Course title |
| `course_slug` | TEXT | Course URL slug |
| `course_image_url` | TEXT | Course image |
| `total_lessons` | BIGINT | Total lessons in course |
| `completed_lessons` | BIGINT | Lessons marked complete by user |
| `progress_percentage` | DECIMAL | % completion (0-100) |

**Security**: Uses `auth.uid()` internally - no user_id parameter needed.

---

## How It Works

1. **Joins enrolled courses** via `academy_enrollments`
2. **Counts total lessons** from `academy_modules` → `academy_lessons`
3. **Counts completed lessons** from `academy_progress`
4. **Calculates percentage** with safe division (never divides by 0)

```sql
total_lessons = COUNT(DISTINCT lessons)
completed_lessons = COUNT(DISTINCT progress records)
percentage = (completed_lessons / total_lessons) * 100
```

**Edge Cases**:
- Course with 0 lessons → returns `0%` (not error)
- No progress records → `0/N` lessons, `0%`

---

## Frontend Usage

### Hook: `useUserProgress()`

```tsx
import { useUserProgress } from '@/hooks/useUserProgress'

function Dashboard() {
  const { data: progressData, isLoading } = useUserProgress()
  
  return (
    <div>
      {progressData?.map(course => (
        <div key={course.course_id}>
          <h2>{course.course_title}</h2>
          <p>{course.completed_lessons}/{course.total_lessons} aulas</p>
          <p>{course.progress_percentage}%</p>
        </div>
      ))}
    </div>
  )
}
```

---

## Debugging Progress Issues

### 1. Verify Total Lessons Count

```sql
SELECT 
  c.title,
  c.id as course_id,
  COUNT(DISTINCT l.id) as total_lessons
FROM academy_courses c
LEFT JOIN academy_modules m ON m.course_id = c.id
LEFT JOIN academy_lessons l ON l.module_id = m.id
WHERE c.id = 'COURSE_ID_HERE'
GROUP BY c.id, c.title;
```

**Expected**: Should match number of lessons you see in admin.

### 2. Verify Completed Lessons

```sql
SELECT 
  l.title as lesson_title,
  p.completed_at
FROM academy_progress p
INNER JOIN academy_lessons l ON l.id = p.lesson_id
WHERE p.user_id = auth.uid()
  AND l.module_id IN (
    SELECT id FROM academy_modules WHERE course_id = 'COURSE_ID_HERE'
  );
```

**Expected**: List of completed lessons for user in this course.

### 3. Test Progress Function

```sql
-- As authenticated user
SELECT * FROM get_my_course_progress();
```

**Expected**: Returns all enrolled courses with accurate counts.

---

## Common Issues

### Issue: Shows 5/0 or 0/0 lessons

**Cause**: Frontend calculated before nested data loaded, or RLS blocked lesson access.

**Solution**: Use `useUserProgress()` hook - it uses SQL function with proper joins.

### Issue: Progress not updating after completing lesson

**Cause**: `academy_progress` not inserted, or React Query cache not invalidated.

**Solution**:
1. Check `academy_progress` table has record
2. Ensure `invalidateQueries` called after marking complete:

```tsx
queryClient.invalidateQueries({ queryKey: ['user-progress'] })
```

### Issue: Different progress in Dashboard vs. Player

**Cause**: Player uses old `useProgress(courseId)` hook.

**Solution**: Migrate Player to use `useUserProgress()` and filter by course.

---

## Manual Testing

### 1. Create Test User
```sql
-- Get user ID from Supabase Auth dashboard
```

### 2. Enroll in Course
```sql
INSERT INTO academy_enrollments (user_id, course_id)
VALUES ('USER_ID', 'COURSE_ID');
```

### 3. Mark Lesson Complete
```sql
INSERT INTO academy_progress (user_id, lesson_id)
VALUES ('USER_ID', 'LESSON_ID');
```

### 4. Check Progress
```sql
SELECT * FROM get_my_course_progress();
```

---

## Best Practices

✅ **Always use `useUserProgress()` for progress in Dashboard**  
✅ **Invalidate cache after marking lessons complete**  
✅ **Don't calculate totals in frontend** (use SQL data directly)  
✅ **Handle 0-lesson courses gracefully** (show "Nenhuma aula" instead of 0/0)

❌ **Never** trust frontend-calculated lesson counts  
❌ **Never** pass user_id from client to progress functions (security risk)  
❌ **Never** assume nested data is fully loaded without explicit query
