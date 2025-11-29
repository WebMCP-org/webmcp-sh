import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insert_memory_block_schema, type InsertMemoryBlock, type UpdateMemoryBlock } from '@/lib/db/schema';
import { memory_blocks } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { countTokens } from '@/lib/tokenizer';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { tooltips } from '@/lib/tooltip-content';

interface MemoryBlockFormProps {
  block?: UpdateMemoryBlock;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const blockTypes = [
  { value: 'user_profile', label: 'User Profile' },
  { value: 'agent_persona', label: 'Agent Persona' },
  { value: 'current_goals', label: 'Current Goals' },
  { value: 'context', label: 'Context' },
] as const;

export function MemoryBlockForm({ block, onSuccess, onCancel }: MemoryBlockFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);

  const form = useForm<InsertMemoryBlock>({
    resolver: zodResolver(insert_memory_block_schema as any),
    defaultValues: block ?? {
      block_type: 'context',
      label: '',
      value: '',
      char_limit: 500,
      priority: 0,
    },
  });

  // Watch the value field for changes and calculate tokens
  const valueWatch = form.watch('value');

  useEffect(() => {
    const tokens = countTokens(valueWatch || '');
    setTokenCount(tokens);
  }, [valueWatch]);

  const onSubmit = async (data: InsertMemoryBlock) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(block?.id ? 'Updating memory block...' : 'Creating memory block...');

    try {
      // Token cost is automatically calculated in the database layer
      if (block?.id) {
        await memory_blocks.update({ id: block.id, ...data });
        toast.success('Memory block updated!', {
          id: loadingToast,
          description: `"${data.label}" has been updated.`,
        });
      } else {
        await memory_blocks.create(data);
        toast.success('Memory block created!', {
          id: loadingToast,
          description: `"${data.label}" is now always in context.`,
        });
      }
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to save memory block', {
        id: loadingToast,
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Block Type */}
        <FormField
          control={form.control}
          name="block_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                Block Type *
                <InfoTooltip
                  content={
                    <div className="space-y-2">
                      {blockTypes.map(type => (
                        <div key={type.value}>
                          <span className="font-semibold">{type.label}:</span>{' '}
                          {tooltips.blockTypes[type.value as keyof typeof tooltips.blockTypes]}
                        </div>
                      ))}
                    </div>
                  }
                />
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a block type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {blockTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The type of always-in-context memory this block represents
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Label */}
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Human-readable label"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Value */}
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-1">
                  Content *
                  <InfoTooltip content={tooltips.technical.tokenCost} />
                </FormLabel>
                <span className="text-xs text-gray-500">
                  {tokenCount} tokens ({field.value?.length || 0} chars)
                </span>
              </div>
              <FormControl>
                <Textarea
                  placeholder="The actual memory content (always in context)"
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Token count is calculated in real-time using GPT tokenizer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Character Limit */}
        <FormField
          control={form.control}
          name="char_limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Character Limit</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>
                Context window budget for this block
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                Priority
                <InfoTooltip content={tooltips.formFields.priority} />
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>
                Higher = more important
              </FormDescription>
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
            {block?.id ? 'Update Block' : 'Create Block'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
