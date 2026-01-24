import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { z } from "zod";

import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type PageType = "destination" | "gear";

type CommentRow = {
  id: string;
  page_slug: string;
  page_type: string;
  user_id: string;
  content: string;
  created_at: string;
  is_hidden: boolean;
};

const emailSchema = z.string().trim().email().max(255);
const commentSchema = z.string().trim().min(1, "Comment cannot be empty").max(1000);

export default function CommentsSection({
  pageSlug,
  pageType,
}: {
  pageSlug: string;
  pageType: PageType;
}) {
  const qc = useQueryClient();
  const { user, sendMagicLink, signOut, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const queryKey = useMemo(() => ["comments", pageType, pageSlug], [pageType, pageSlug]);

  const commentsQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<CommentRow[]> => {
      const { data, error } = await supabase
        .from("comments")
        .select("id,page_slug,page_type,user_id,content,created_at,is_hidden")
        .eq("page_slug", pageSlug)
        .eq("page_type", pageType)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as CommentRow[];
    },
    enabled: Boolean(pageSlug),
  });

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("comments").insert({
        page_slug: pageSlug,
        page_type: pageType,
        user_id: user.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setNewComment("");
      await qc.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast({
        title: "Could not post comment",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("comments").update({ content }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      setEditingId(null);
      setEditDraft("");
      await qc.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast({
        title: "Could not update comment",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast({
        title: "Could not delete comment",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    },
  });

  async function onSendMagicLink() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast({
        title: "Enter a valid email",
        description: "Please check the email address and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendMagicLink(parsed.data);
      toast({
        title: "Magic link sent",
        description: "Check your email for the sign-in link.",
      });
    } catch (err: any) {
      toast({
        title: "Could not send magic link",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  }

  async function onPostComment() {
    const parsed = commentSchema.safeParse(newComment);
    if (!parsed.success) {
      toast({
        title: "Comment is required",
        description: parsed.error.issues[0]?.message,
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(parsed.data);
  }

  async function onSaveEdit() {
    if (!editingId) return;
    const parsed = commentSchema.safeParse(editDraft);
    if (!parsed.success) {
      toast({
        title: "Comment is required",
        description: parsed.error.issues[0]?.message,
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({ id: editingId, content: parsed.data });
  }

  const comments = commentsQuery.data ?? [];

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Comments</h2>
          <p className="text-muted-foreground text-sm">{comments.length} total</p>
        </div>

        {user && (
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        )}
      </div>

      {/* Read-only list for everyone */}
      <div className="space-y-4">
        {commentsQuery.isLoading ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">Loading comments…</CardContent>
          </Card>
        ) : commentsQuery.isError ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              Comments couldn’t be loaded right now.
            </CardContent>
          </Card>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">Be the first to comment.</CardContent>
          </Card>
        ) : (
          comments.map((c) => {
            const isMine = Boolean(user?.id) && c.user_id === user!.id;
            const authorLabel = isMine ? "You" : "Traveler";
            const isEditing = editingId === c.id;

            return (
              <Card key={c.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-medium text-foreground">{authorLabel}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNowStrict(new Date(c.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      {!isEditing ? (
                        <p className="mt-3 text-foreground whitespace-pre-wrap break-words">
                          {c.content}
                        </p>
                      ) : (
                        <div className="mt-3 space-y-3">
                          <Textarea
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            placeholder="Edit your comment…"
                          />
                          <div className="flex gap-2">
                            <Button onClick={onSaveEdit} disabled={updateMutation.isPending}>
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingId(null);
                                setEditDraft("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {isMine && !isEditing && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(c.id);
                            setEditDraft(c.content);
                          }}
                        >
                          Edit
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This can’t be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(c.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Composer / Sign-in */}
      <div className="mt-8">
        {!user ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="font-medium text-foreground">Sign in to comment</p>
                <p className="text-sm text-muted-foreground">
                  We’ll email you a magic link to sign in.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                />
                <Button onClick={onSendMagicLink} disabled={authLoading}>
                  Send magic link
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                No anonymous commenting.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 space-y-3">
              <p className="font-medium text-foreground">Add a comment</p>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment…"
              />
              <div className="flex justify-end">
                <Button onClick={onPostComment} disabled={createMutation.isPending}>
                  Post comment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
