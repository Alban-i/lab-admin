import { createClient } from '@/providers/supabase/client';

export interface GlossaryTerm {
  id: number;
  term: string;
  slug: string;
  definition: string;
}

/**
 * Fetch all glossary terms from the database
 */
export async function fetchGlossaryTerms(): Promise<GlossaryTerm[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('glossary')
      .select('id, term, slug, definition')
      .order('term');

    if (error) {
      console.error('Error fetching glossary terms:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching glossary terms:', error);
    return [];
  }
}

/**
 * Create a regex pattern for finding glossary terms in text
 * Uses word boundaries to avoid partial matches
 */
export function createTermRegex(term: string): RegExp {
  // Escape special regex characters and create word boundary pattern
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escapedTerm}\\b`, 'gi');
}

/**
 * Find all glossary term matches in a text string
 */
export function findGlossaryMatches(text: string, terms: GlossaryTerm[]): Array<{
  term: GlossaryTerm;
  start: number;
  end: number;
  matchedText: string;
}> {
  const matches: Array<{
    term: GlossaryTerm;
    start: number;
    end: number;
    matchedText: string;
  }> = [];

  terms.forEach(term => {
    const regex = createTermRegex(term.term);
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        term,
        start: match.index,
        end: match.index + match[0].length,
        matchedText: match[0]
      });
    }
  });

  // Sort matches by start position
  return matches.sort((a, b) => a.start - b.start);
}

/**
 * Check if two ranges overlap
 */
export function rangesOverlap(
  start1: number, 
  end1: number, 
  start2: number, 
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Remove overlapping matches, keeping the first occurrence
 */
export function removeOverlappingMatches(matches: Array<{
  term: GlossaryTerm;
  start: number;
  end: number;
  matchedText: string;
}>): Array<{
  term: GlossaryTerm;
  start: number;
  end: number;
  matchedText: string;
}> {
  const nonOverlapping: typeof matches = [];
  
  matches.forEach(match => {
    const overlaps = nonOverlapping.some(existing => 
      rangesOverlap(match.start, match.end, existing.start, existing.end)
    );
    
    if (!overlaps) {
      nonOverlapping.push(match);
    }
  });
  
  return nonOverlapping;
}

/**
 * Process text content and return information about glossary term positions
 */
export async function processTextForGlossaryTerms(text: string): Promise<Array<{
  term: GlossaryTerm;
  start: number;
  end: number;
  matchedText: string;
}>> {
  const terms = await fetchGlossaryTerms();
  const matches = findGlossaryMatches(text, terms);
  return removeOverlappingMatches(matches);
}