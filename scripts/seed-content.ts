import { createClient } from '@supabase/supabase-js';
import { paths } from '../src/data/paths';
import { lessonContent } from '../src/data/lessonContent';

type PathInfo = (typeof paths)[keyof typeof paths];
type ModuleInfo = PathInfo['modules'][number];
type LessonStub = ModuleInfo['lessons'][number];

interface SeedStats {
  upsertedPaths: number;
  upsertedModules: number;
  upsertedLessons: number;
  missingContent: string[];
  unreachableContent: string[];
}

interface ContentCoverage {
  paths: number;
  modules: number;
  lessons: number;
  missingContent: string[];
  unreachableContent: string[];
}

const PATH_ICON_BY_SLUG: Record<string, string> = {
  'ai-writing-systems': 'pen-line',
  'ai-everyday-life': 'home',
  'ai-for-creators': 'palette',
  'ai-for-small-business': 'briefcase',
  'ai-for-productivity': 'zap',
  'build-with-ai': 'code',
};

function readEnv(name: string): string | undefined {
  return process.env[name]?.trim();
}

function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function assertUniqueIds() {
  const moduleOwners = new Map<string, string>();
  const lessonOwners = new Map<string, string>();

  for (const pathInfo of Object.values(paths)) {
    for (const moduleInfo of pathInfo.modules) {
      const existingModuleOwner = moduleOwners.get(moduleInfo.id);
      if (existingModuleOwner) {
        throw new Error(`Duplicate module id "${moduleInfo.id}" in ${existingModuleOwner} and ${pathInfo.id}`);
      }
      moduleOwners.set(moduleInfo.id, pathInfo.id);

      for (const lesson of moduleInfo.lessons) {
        const existingLessonOwner = lessonOwners.get(lesson.id);
        if (existingLessonOwner) {
          throw new Error(`Duplicate lesson id "${lesson.id}" in ${existingLessonOwner} and ${pathInfo.id}`);
        }
        lessonOwners.set(lesson.id, pathInfo.id);
      }
    }
  }
}

function collectReachableLessonIds(): Set<string> {
  const reachable = new Set<string>();
  for (const pathInfo of Object.values(paths)) {
    for (const moduleInfo of pathInfo.modules) {
      for (const lesson of moduleInfo.lessons) {
        reachable.add(lesson.id);
      }
    }
  }
  return reachable;
}

function pathPayload(pathInfo: PathInfo, sortOrder: number) {
  return {
    title: pathInfo.title,
    slug: pathInfo.id,
    description: pathInfo.description,
    focus: pathInfo.description,
    labs: [],
    final_project: pathInfo.finalProject,
    icon: PATH_ICON_BY_SLUG[pathInfo.id] ?? 'book-open',
    level: pathInfo.level,
    total_time: pathInfo.totalTime,
    sort_order: sortOrder,
    is_published: true,
  };
}

function modulePayload(moduleInfo: ModuleInfo, pathId: string, sortOrder: number) {
  return {
    id: moduleInfo.id,
    path_id: pathId,
    title: moduleInfo.title,
    description: moduleInfo.description,
    sort_order: sortOrder,
  };
}

function lessonPayload(lesson: LessonStub, moduleId: string, sortOrder: number) {
  const body = lessonContent[lesson.id];
  return {
    id: lesson.id,
    module_id: moduleId,
    title: body?.title ?? lesson.title,
    duration: body?.duration ?? lesson.duration,
    sort_order: sortOrder,
    content: body?.content ?? [],
    volatility: body?.volatility ?? null,
    last_reviewed: body?.lastReviewed ?? null,
    review_interval_days: body?.reviewIntervalDays ?? null,
    is_published: true,
  };
}

function summarizeCoverage(pathEntries: PathInfo[]): ContentCoverage {
  const reachableLessonIds = collectReachableLessonIds();

  return {
    paths: pathEntries.length,
    modules: pathEntries.reduce((sum, pathInfo) => sum + pathInfo.modules.length, 0),
    lessons: pathEntries.reduce(
      (pathSum, pathInfo) =>
        pathSum + pathInfo.modules.reduce((moduleSum, moduleInfo) => moduleSum + moduleInfo.lessons.length, 0),
      0,
    ),
    missingContent: Array.from(reachableLessonIds).filter((lessonId) => !lessonContent[lessonId]),
    unreachableContent: Object.keys(lessonContent).filter((lessonId) => !reachableLessonIds.has(lessonId)),
  };
}

function logCoverage(coverage: ContentCoverage): void {
  console.log(`Source content: ${coverage.paths} paths, ${coverage.modules} modules, ${coverage.lessons} lessons`);

  if (coverage.missingContent.length === 0) {
    console.log('Metadata-only lessons: none');
  } else {
    console.log(
      `Metadata-only lessons: ${coverage.missingContent.length} ` +
        '(seeded from src/data/paths.ts with empty content arrays)',
    );
    for (const lessonId of coverage.missingContent) {
      console.log(`  - ${lessonId}`);
    }
  }

  if (coverage.unreachableContent.length === 0) {
    console.log('Skipped unreachable lessonContent entries: none');
  } else {
    console.log(`Skipped unreachable lessonContent entries: ${coverage.unreachableContent.length}`);
    for (const lessonId of coverage.unreachableContent) {
      console.log(`  - ${lessonId}`);
    }
  }
}

async function main() {
  assertUniqueIds();

  const dryRun = process.argv.includes('--dry-run');
  const pathEntries = Object.values(paths);
  const coverage = summarizeCoverage(pathEntries);

  if (dryRun) {
    console.log('Dry run: no database writes will be performed.');
    logCoverage(coverage);
    console.log(JSON.stringify({ dryRun: true, ...coverage }, null, 2));
    return;
  }

  const supabaseUrl = readEnv('SUPABASE_URL') ?? readEnv('VITE_SUPABASE_URL');
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL or VITE_SUPABASE_URL');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const stats: SeedStats = {
    upsertedPaths: 0,
    upsertedModules: 0,
    upsertedLessons: 0,
    missingContent: coverage.missingContent,
    unreachableContent: coverage.unreachableContent,
  };

  console.log('Starting content seed from src/data/paths.ts and src/data/lessonContent.ts');
  logCoverage(coverage);

  const pathRows = pathEntries.map((pathInfo, index) => pathPayload(pathInfo, index));

  const { data: upsertedPaths, error: pathError } = await supabase
    .from('learning_paths')
    .upsert(pathRows, { onConflict: 'slug' })
    .select('id, slug');

  if (pathError) throw pathError;

  const pathIdBySlug = new Map((upsertedPaths ?? []).map((row) => [row.slug as string, row.id as string]));
  stats.upsertedPaths = upsertedPaths?.length ?? 0;
  console.log(`Upserted learning_paths: ${stats.upsertedPaths}`);

  for (const [pathIndex, pathInfo] of pathEntries.entries()) {
    const pathId = pathIdBySlug.get(pathInfo.id);
    if (!pathId) {
      throw new Error(`Path upsert did not return an id for slug "${pathInfo.id}"`);
    }

    const moduleRows = pathInfo.modules.map((moduleInfo, index) => modulePayload(moduleInfo, pathId, index));
    const { error: moduleError } = await supabase
      .from('modules')
      .upsert(moduleRows, { onConflict: 'id' });

    if (moduleError) throw moduleError;
    stats.upsertedModules += moduleRows.length;

    let lessonsForPath = 0;
    for (const moduleInfo of pathInfo.modules) {
      const lessonRows = moduleInfo.lessons.map((lesson, index) => {
        return lessonPayload(lesson, moduleInfo.id, index);
      });

      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert(lessonRows, { onConflict: 'id' });

      if (lessonError) throw lessonError;
      stats.upsertedLessons += lessonRows.length;
      lessonsForPath += lessonRows.length;
    }

    console.log(
      `Upserted ${pathIndex + 1}/${pathEntries.length}: ${pathInfo.id} ` +
        `(${moduleRows.length} modules, ${lessonsForPath} lessons)`,
    );
  }

  console.log(JSON.stringify(stats, null, 2));

  if (stats.missingContent.length > 0 || stats.unreachableContent.length > 0) {
    console.warn('Content seed completed with coverage warnings; see metadata-only/skipped lists above.');
  } else {
    console.log('Content seed completed without coverage warnings.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
