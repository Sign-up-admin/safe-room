@echo off
echo Checking TypeScript compilation for new features...

echo.
echo Testing useBookingRecommend.ts...
npx tsc --noEmit --strict false --target es2020 --module esnext --lib es2020,dom --moduleResolution bundler --allowJs false --jsx preserve src/composables/useBookingRecommend.ts
if %errorlevel% neq 0 (
    echo ❌ useBookingRecommend.ts compilation failed
    exit /b 1
) else (
    echo ✅ useBookingRecommend.ts compiled successfully
)

echo.
echo Testing useFavoritesStore.ts...
npx tsc --noEmit --strict false --target es2020 --module esnext --lib es2020,dom --moduleResolution bundler --allowJs false --jsx preserve src/composables/useFavoritesStore.ts
if %errorlevel% neq 0 (
    echo ❌ useFavoritesStore.ts compilation failed
    exit /b 1
) else (
    echo ✅ useFavoritesStore.ts compiled successfully
)

echo.
echo Testing DiscussionComposer.vue...
npx vue-tsc --noEmit --strict false src/components/discussion/DiscussionComposer.vue
if %errorlevel% neq 0 (
    echo ❌ DiscussionComposer.vue compilation failed
    exit /b 1
) else (
    echo ✅ DiscussionComposer.vue compiled successfully
)

echo.
echo Testing FavoritesOverview.vue...
npx vue-tsc --noEmit --strict false src/components/favorites/FavoritesOverview.vue
if %errorlevel% neq 0 (
    echo ❌ FavoritesOverview.vue compilation failed
    exit /b 1
) else (
    echo ✅ FavoritesOverview.vue compiled successfully
)

echo.
echo Testing formatters.ts...
npx tsc --noEmit --strict false --target es2020 --module esnext --lib es2020,dom --moduleResolution bundler --allowJs false --jsx preserve src/utils/formatters.ts
if %errorlevel% neq 0 (
    echo ❌ formatters.ts compilation failed
    exit /b 1
) else (
    echo ✅ formatters.ts compiled successfully
)

echo.
echo 🎉 All new features compiled successfully!
echo Code compilation verification passed.
