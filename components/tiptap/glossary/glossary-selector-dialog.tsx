'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { fetchGlossaryTerms, GlossaryTerm } from './glossary-utils';

interface GlossarySelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (term: GlossaryTerm) => void;
  selectedText?: string;
}

export function GlossarySelectorDialog({
  isOpen,
  onClose,
  onSelect,
  selectedText = '',
}: GlossarySelectorDialogProps) {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTerms();
      // Pre-fill search with selected text if available
      if (selectedText) {
        setSearchQuery(selectedText);
      }
    }
  }, [isOpen, selectedText]);

  useEffect(() => {
    // Filter terms based on search query
    if (searchQuery) {
      const filtered = terms.filter(term =>
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTerms(filtered);
    } else {
      setFilteredTerms(terms);
    }
  }, [searchQuery, terms]);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const glossaryTerms = await fetchGlossaryTerms();
      setTerms(glossaryTerms);
      setFilteredTerms(glossaryTerms);
    } catch (error) {
      console.error('Error loading glossary terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (term: GlossaryTerm) => {
    onSelect(term);
    onClose();
    setSearchQuery('');
  };

  const handleClose = () => {
    onClose();
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Glossary Term</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Search terms or definitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <ScrollArea className="h-80">
            {loading ? (
              <div className="text-center p-4">Loading terms...</div>
            ) : filteredTerms.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                {searchQuery ? 'No terms found matching your search.' : 'No glossary terms available.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTerms.map((term) => (
                  <div
                    key={term.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelect(term)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {term.term}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {term.definition}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}