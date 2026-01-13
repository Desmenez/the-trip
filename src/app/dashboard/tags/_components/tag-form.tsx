"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tagFormSchema = z.object({
  name: z.string().min(1, {
    message: "Tag name is required.",
  }),
  order: z.number().int().min(0).optional(),
});

export type TagFormValues = z.infer<typeof tagFormSchema>;

interface PositionTag {
  id: string;
  name: string;
  order: number;
}

interface TagFormProps {
  mode: "create" | "edit" | "view";
  initialData?: Partial<TagFormValues>;
  onSubmit?: (values: TagFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  allTagsForPosition?: PositionTag[]; // For position select (create/edit)
  currentTagId?: string; // For edit mode to exclude current tag from options
}

export function TagForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  allTagsForPosition = [],
  currentTagId,
}: TagFormProps) {
  const readOnly = mode === "view";

  // Calculate default order for create mode (last position + 1)
  const maxOrder = allTagsForPosition.length > 0 
    ? Math.max(...allTagsForPosition.map((t) => t.order))
    : -1;
  const defaultOrderForCreate = maxOrder + 1;

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: "",
      order: mode === "create" ? defaultOrderForCreate : undefined,
    },
  });

  // Sync initial data (for edit/view)
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        order: initialData.order,
      });
    }
  }, [initialData, form]);

  async function handleSubmit(values: TagFormValues) {
    if (!onSubmit || readOnly) return;
    await onSubmit(values);
  }

  // Build position options
  const currentTag = currentTagId ? allTagsForPosition.find((t) => t.id === currentTagId) : undefined;

  const otherTags = currentTagId != null ? allTagsForPosition.filter((t) => t.id !== currentTagId) : allTagsForPosition;

  const sortedOtherTags = [...otherTags].sort((a, b) => a.order - b.order);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Tag Name</FormLabel>
              <FormControl>
                <Input placeholder="VIP, Corporate, etc." {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "view" ? (
          // Simple read-only display for order
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input
                    value={field.value !== undefined ? field.value.toString() : (currentTag?.order?.toString() ?? "")}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          // Editable position selection for create/edit
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <Select
                  value={
                    field.value !== undefined
                      ? field.value.toString()
                      : mode === "edit" && currentTag
                        ? currentTag.order.toString()
                        : mode === "create"
                          ? defaultOrderForCreate.toString()
                          : "end"
                  }
                  onValueChange={(value) => {
                    if (value === "end") {
                      field.onChange(undefined);
                    } else {
                      field.onChange(parseInt(value, 10));
                    }
                  }}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mode === "edit" && currentTag && (
                      <SelectItem value={currentTag.order.toString()}>
                        {(currentTag.order + 1).toString()}
                      </SelectItem>
                    )}
                    {sortedOtherTags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.order.toString()}>
                        {(tag.order + 1).toString()}
                      </SelectItem>
                    ))}
                    {mode === "create" && (
                      <SelectItem value={defaultOrderForCreate.toString()}>
                        {(defaultOrderForCreate + 1).toString()}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <FormDescription>
                  {mode === "create"
                    ? "Select where to insert this tag. Existing tags at this position and after will be shifted down."
                    : "Select the new position for this tag. Other tags will be automatically reordered."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {mode !== "view" && (
          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Tag"
                  : "Update Tag"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
