import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insert_memory_entity_schema } from '@/lib/db/schema';
import type { InsertMemoryEntity, UpdateMemoryEntity } from '@/lib/db/types';
import { memory_entities } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MemoryEntityFormProps {
  entity?: UpdateMemoryEntity;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const categories = [
  { value: 'fact', label: 'Fact' },
  { value: 'preference', label: 'Preference' },
  { value: 'skill', label: 'Skill' },
  { value: 'rule', label: 'Rule' },
  { value: 'context', label: 'Context' },
  { value: 'person', label: 'Person' },
  { value: 'project', label: 'Project' },
  { value: 'goal', label: 'Goal' },
] as const;

export function MemoryEntityForm({ entity, onSuccess, onCancel }: MemoryEntityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(entity?.tags ?? []);

  const form = useForm<InsertMemoryEntity>({
    resolver: zodResolver(insert_memory_entity_schema as any),
    defaultValues: entity ?? {
      category: 'fact',
      name: '',
      description: '',
      tags: [],
      confidence: 100,
      importance_score: 50,
    },
  });

  const onSubmit = async (data: InsertMemoryEntity) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(entity?.id ? 'Updating entity...' : 'Creating entity...');

    try {
      if (entity?.id) {
        await memory_entities.update({ id: entity.id, ...data, tags: tags || (Array.isArray(data.tags) ? data.tags : []) });
        toast.success('Entity updated successfully!', {
          id: loadingToast,
          description: `"${data.name}" has been updated.`,
        });
      } else {
        await memory_entities.create({ ...data, tags });
        toast.success('Entity created successfully!', {
          id: loadingToast,
          description: `"${data.name}" has been added to your knowledge base.`,
        });
      }
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to save entity', {
        id: loadingToast,
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      form.setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Python programming"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of this entity..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag..."
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-sm rounded flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700:text-gray-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confidence */}
        <FormField
          control={form.control}
          name="confidence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confidence (0-100)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Importance Score */}
        <FormField
          control={form.control}
          name="importance_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importance Score (0-100)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-divide">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {entity?.id ? 'Update Entity' : 'Create Entity'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
