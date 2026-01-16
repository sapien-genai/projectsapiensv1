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

export async function updatePromptLibrary(userId: string) {
  try {
    console.log('Starting prompt library update for user:', userId);

    const { data: categories, error: catError } = await supabase
      .from('prompt_categories')
      .select('id, slug');

    if (catError) {
      console.error('Category fetch error:', catError);
      return { success: false, error: `Categories error: ${catError.message}` };
    }

    if (!categories) {
      console.error('No categories found');
      return { success: false, error: 'Categories not found' };
    }

    console.log('Found categories:', categories);
    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

    const { data: existingPrompts, error: promptError } = await supabase
      .from('prompts')
      .select('id, title, prompt_text')
      .eq('user_id', userId);

    if (promptError) {
      console.error('Prompt fetch error:', promptError);
      return { success: false, error: `Prompts error: ${promptError.message}` };
    }

    console.log('Found existing prompts:', existingPrompts?.length || 0);

    const existingTitles = new Map(
      existingPrompts?.map(p => [p.title, p.id]) || []
    );

    let updatedCount = 0;
    let insertedCount = 0;
    const errors: string[] = [];

    for (const prompt of seedPrompts) {
      const promptData = {
        user_id: userId,
        title: prompt.title,
        description: prompt.description,
        prompt_text: prompt.prompt_text,
        category_id: categoryMap.get(categoryMapping[prompt.category]),
        tags: prompt.tags,
        use_case: prompt.use_case,
        is_public: true,
        is_featured: true
      };

      const existingId = existingTitles.get(prompt.title);

      if (existingId) {
        console.log(`Updating prompt: "${prompt.title}"`);
        const { error } = await supabase
          .from('prompts')
          .update(promptData)
          .eq('id', existingId);

        if (error) {
          console.error(`Error updating prompt "${prompt.title}":`, error);
          errors.push(`${prompt.title}: ${error.message}`);
        } else {
          console.log(`Successfully updated: "${prompt.title}"`);
          updatedCount++;
        }
      } else {
        console.log(`Inserting new prompt: "${prompt.title}"`);
        const { error } = await supabase
          .from('prompts')
          .insert({
            ...promptData,
            likes_count: Math.floor(Math.random() * 50) + 10,
            usage_count: Math.floor(Math.random() * 100) + 20,
            avg_rating: (Math.random() * 1.5 + 3.5).toFixed(2),
            rating_count: Math.floor(Math.random() * 30) + 5
          });

        if (error) {
          console.error(`Error inserting prompt "${prompt.title}":`, error);
          errors.push(`${prompt.title}: ${error.message}`);
        } else {
          console.log(`Successfully inserted: "${prompt.title}"`);
          insertedCount++;
        }
      }
    }

    const message = `Updated ${updatedCount} prompts, inserted ${insertedCount} new prompts`;
    console.log(message);

    if (errors.length > 0) {
      console.error('Errors encountered:', errors);
      return {
        success: false,
        updated: updatedCount,
        inserted: insertedCount,
        error: `Some prompts failed: ${errors.join('; ')}`
      };
    }

    return {
      success: true,
      updated: updatedCount,
      inserted: insertedCount,
      message
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: String(err) };
  }
}
