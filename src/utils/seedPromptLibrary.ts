import { supabase } from '../lib/supabase';
import { seedPrompts } from '../data/seedPrompts';

const categoryMapping: Record<string, string> = {
  'writing': 'writing',
  'analysis': 'analysis',
  'creative': 'creative',
  'coding': 'coding',
  'strategy': 'strategy',
  'learning': 'learning'
};

export async function seedPromptLibrary(userId: string) {
  try {
    const { data: categories } = await supabase
      .from('prompt_categories')
      .select('id, slug');

    if (!categories) {
      console.error('Failed to load categories');
      return { success: false, error: 'Categories not found' };
    }

    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

    const promptsToInsert = seedPrompts.map(prompt => ({
      user_id: userId,
      title: prompt.title,
      description: prompt.description,
      prompt_text: prompt.prompt_text,
      category_id: categoryMap.get(categoryMapping[prompt.category]),
      tags: prompt.tags,
      use_case: prompt.use_case,
      is_public: true,
      is_featured: true,
      likes_count: Math.floor(Math.random() * 50) + 10,
      usage_count: Math.floor(Math.random() * 100) + 20,
      avg_rating: (Math.random() * 1.5 + 3.5).toFixed(2),
      rating_count: Math.floor(Math.random() * 30) + 5
    }));

    const { error } = await supabase
      .from('prompts')
      .insert(promptsToInsert);

    if (error) {
      console.error('Error seeding prompts:', error);
      return { success: false, error: error.message };
    }

    return { success: true, count: promptsToInsert.length };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: String(err) };
  }
}
