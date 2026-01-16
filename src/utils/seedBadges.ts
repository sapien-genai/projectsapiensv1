import { supabase } from '../lib/supabase';
import { badgeDefinitions } from '../data/badgeDefinitions';

export async function seedBadges() {
  try {
    const { data: existingBadges, error: fetchError } = await supabase
      .from('badges')
      .select('id');

    if (fetchError) {
      console.error('Error fetching badges:', fetchError);
      return { success: false, error: fetchError };
    }

    const existingBadgeIds = new Set(existingBadges?.map(b => b.id) || []);
    const badgesToInsert = badgeDefinitions.filter(badge => !existingBadgeIds.has(badge.id));

    if (badgesToInsert.length === 0) {
      console.log('All badges already seeded');
      return { success: true, message: 'All badges already exist' };
    }

    const { error: insertError } = await supabase
      .from('badges')
      .insert(badgesToInsert.map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        icon: badge.icon,
        color: badge.color,
        rarity: badge.rarity,
        points: badge.points,
        criteria: badge.criteria,
        sort_order: badge.sort_order,
        is_active: true
      })));

    if (insertError) {
      console.error('Error inserting badges:', insertError);
      return { success: false, error: insertError };
    }

    console.log(`Successfully seeded ${badgesToInsert.length} badges`);
    return { success: true, count: badgesToInsert.length };
  } catch (error) {
    console.error('Unexpected error seeding badges:', error);
    return { success: false, error };
  }
}
