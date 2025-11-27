"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useCreateTag, useAllTags } from "../hooks/use-tags";

const tagFormSchema = z.object({
  name: z.string().min(1, {
    message: "Tag name is required.",
  }),
  order: z.number().int().min(0).optional(),
});

type TagFormValues = z.infer<typeof tagFormSchema>;

export default function CreateTagPage() {
  const router = useRouter();
  const createTagMutation = useCreateTag();
  const { data: allTags, isLoading: isLoadingTags } = useAllTags();

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: "",
      order: undefined,
    },
  });

  async function handleSubmit(values: TagFormValues) {
    try {
      await createTagMutation.mutateAsync(values);
      router.push("/dashboard/tags");
      router.refresh();
    } catch (error) {
      // Error is already handled in the mutation's onError
      console.error(error);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">New Tag</h2>
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
                    value={field.value !== undefined ? field.value.toString() : "end"}
                    onValueChange={(value) => {
                      if (value === "end") {
                        field.onChange(undefined);
                      } else {
                        field.onChange(parseInt(value, 10));
                      }
                    }}
                    disabled={isLoadingTags}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allTags &&
                        allTags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.order.toString()}>
                            Insert at position {tag.order} (before &quot;{tag.name}&quot;)
                          </SelectItem>
                        ))}
                      <SelectItem value="end">End (after all tags)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select where to insert this tag. Existing tags at this position and after will be shifted down.
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
                disabled={createTagMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTagMutation.isPending}>
                {createTagMutation.isPending ? "Creating..." : "Create Tag"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

