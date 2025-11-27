"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useTag, useUpdateTag, useAllTags } from "../../hooks/use-tags";

const tagFormSchema = z.object({
  name: z.string().min(1, {
    message: "Tag name is required.",
  }),
  order: z.number().int().min(0).optional(),
});

type TagFormValues = z.infer<typeof tagFormSchema>;

export default function EditTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const tagId = resolvedParams.id;

  const { data: tag, isLoading: isLoadingTag, error: tagError } = useTag(tagId);
  const updateTagMutation = useUpdateTag();
  const { data: allTags, isLoading: isLoadingTags } = useAllTags();

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: "",
      order: undefined,
    },
  });

  // Reset form when tag data is loaded
  useEffect(() => {
    if (tag) {
      form.reset({
        name: tag.name || "",
        order: tag.order,
      });
    }
  }, [tag, form]);

  // Filter out current tag from allTags for position selection
  const otherTags = allTags?.filter((t) => t.id !== tagId) || [];
  
  // Sort other tags by order
  const sortedOtherTags = [...otherTags].sort((a, b) => a.order - b.order);

  async function handleSubmit(values: TagFormValues) {
    try {
      await updateTagMutation.mutateAsync({
        id: tagId,
        data: values,
      });
      router.push("/dashboard/tags");
      router.refresh();
    } catch (error) {
      // Error is already handled in the mutation's onError
      console.error(error);
    }
  }

  if (isLoadingTag) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading tag data...</p>
        </div>
      </div>
    );
  }

  if (tagError) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load tag. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Edit Tag</h2>
      </div>

      <div className="bg-card rounded-md border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="VIP, Corporate, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select
                    value={field.value !== undefined ? field.value.toString() : tag?.order.toString()}
                    onValueChange={(value) => {
                      field.onChange(parseInt(value, 10));
                    }}
                    disabled={isLoadingTags || isLoadingTag}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tag && (
                        <SelectItem value={tag.order.toString()}>
                          Keep current position ({tag.order})
                        </SelectItem>
                      )}
                      {sortedOtherTags.map((otherTag) => (
                        <SelectItem key={otherTag.id} value={otherTag.order.toString()}>
                          Position {otherTag.order} (before &quot;{otherTag.name}&quot;)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the new position for this tag. Other tags will be automatically reordered.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={updateTagMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateTagMutation.isPending}>
                {updateTagMutation.isPending ? "Updating..." : "Update Tag"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
