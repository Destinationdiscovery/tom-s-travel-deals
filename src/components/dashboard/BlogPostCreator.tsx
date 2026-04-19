import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Loader2, BookOpen, Eye, Sparkles, X, ImagePlus, Wand2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ContentBlock {
  type: "text" | "heading" | "image";
  value: string;
  caption?: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  category_color: string;
  hero_image_url: string | null;
  excerpt: string | null;
  author: string;
  date_published: string;
  read_time: string;
  rich_content: ContentBlock[];
  created_at: string;
}

const CATEGORIES = [
  { label: "Guides", color: "bg-teal-500" },
  { label: "Packing", color: "bg-purple-500" },
  { label: "Budget", color: "bg-emerald-500" },
  { label: "Insurance", color: "bg-red-500" },
  { label: "Timing", color: "bg-amber-500" },
  { label: "Travel Tips", color: "bg-blue-500" },
  { label: "News", color: "bg-rose-500" },
  { label: "Other", color: "bg-gray-500" },
];

const BlogPostCreator = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Guides");
  const [author, setAuthor] = useState("Tom");
  const [excerpt, setExcerpt] = useState("");
  const [readTime, setReadTime] = useState("5 min read");
  const [tags, setTags] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([{ type: "text", value: "" }]);

  // Auto-format state
  const [rawText, setRawText] = useState("");
  const [imagePool, setImagePool] = useState<File[]>([]);
  const [imagePoolPreviews, setImagePoolPreviews] = useState<string[]>([]);
  const [formatting, setFormatting] = useState(false);

  // Generate from topic state
  const [aiMode, setAiMode] = useState<"generate" | "format">("generate");
  const [topicPrompt, setTopicPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  // Persona selector
  const [persona, setPersona] = useState<"default" | "professional" | "casual">("default");

  // Chart images for format mode (extract data only, never embedded)
  const [chartFiles, setChartFiles] = useState<File[]>([]);
  const [chartPreviews, setChartPreviews] = useState<string[]>([]);

  // AI Edit (when editing an existing post)
  const [aiEditInstruction, setAiEditInstruction] = useState("");
  const [aiEditing, setAiEditing] = useState(false);

  // Affiliate links state (up to 3)
  const [affiliates, setAffiliates] = useState<Array<{ url: string; brand: string; anchor: string }>>([
    { url: "", brand: "", anchor: "" },
  ]);

  const updateAffiliate = (i: number, patch: Partial<{ url: string; brand: string; anchor: string }>) => {
    setAffiliates(prev => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  };
  const addAffiliate = () => {
    if (affiliates.length >= 3) return;
    setAffiliates(prev => [...prev, { url: "", brand: "", anchor: "" }]);
  };
  const removeAffiliate = (i: number) => {
    setAffiliates(prev => (prev.length === 1 ? [{ url: "", brand: "", anchor: "" }] : prev.filter((_, idx) => idx !== i)));
  };

  // FAQ & SEO fields from AI
  const [faqItems, setFaqItems] = useState<Array<{question: string; answer: string}>>([]);
  const [internalLinks, setInternalLinks] = useState<Array<{text: string; url: string}>>([]);
  const [primaryKeyword, setPrimaryKeyword] = useState("");

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const handleRegenerate = async (post: BlogPost) => {
    if (!confirm(`Regenerate "${post.title}" with the latest SEO format? This will replace its content but keep the same URL and publish date.`)) return;
    setRegeneratingId(post.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-post", {
        body: { prompt: post.title },
      });
      if (error) throw new Error(error.message || "Generation failed");
      if (data?.error) throw new Error(data.error);

      console.log("Regenerate response:", { faq_items: data.faq_items?.length, internal_links: data.internal_links?.length, primary_keyword: data.primary_keyword, blocks: data.blocks?.length });

      const updatePayload: any = {
        rich_content: data.blocks?.filter((b: any) => b.value?.trim()) || [],
        excerpt: data.excerpt || post.excerpt,
        read_time: data.read_time || post.read_time,
        tags: data.tags || [],
        hero_image_url: data.hero_image_url || post.hero_image_url,
        faq_items: data.faq_items || [],
        internal_links: data.internal_links || [],
        primary_keyword: data.primary_keyword || null,
        updated_at: new Date().toISOString(),
      };
      if (data.category) {
        updatePayload.category = data.category;
        updatePayload.category_color = CATEGORIES.find(c => c.label === data.category)?.color || "bg-gray-500";
      }

      const { error: updateError } = await supabase.from("blog_posts").update(updatePayload).eq("id", post.id);
      if (updateError) throw updateError;

      const faqCount = data.faq_items?.length || 0;
      toast({ title: "✨ Regenerated!", description: `"${post.title}" updated with new SEO format. ${faqCount} FAQs added.` });
      fetchPosts();
    } catch (e: any) {
      console.error("Regenerate error:", e);
      toast({ title: "Regeneration failed", description: e.message || "Unknown error", variant: "destructive" });
    }
    setRegeneratingId(null);
  };

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false }) as any;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setPosts(data || []);
    setLoading(false);
  };

  const generateSlug = (t: string) => {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) setSlug(generateSlug(val));
  };

  const handleHeroFile = (file: File | null) => {
    setHeroFile(file);
    if (file) setHeroPreview(URL.createObjectURL(file));
    else setHeroPreview("");
  };

  // Image pool handlers
  const handleImagePoolAdd = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setImagePool(prev => [...prev, ...newFiles]);
    setImagePoolPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFromImagePool = (index: number) => {
    URL.revokeObjectURL(imagePoolPreviews[index]);
    setImagePool(prev => prev.filter((_, i) => i !== index));
    setImagePoolPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Generate from topic handler
  const handleGenerateFromTopic = async () => {
    if (!topicPrompt.trim()) {
      toast({ title: "No topic", description: "Enter a topic or prompt first.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const cleanAffiliates = affiliates
        .map(a => ({ url: a.url.trim(), brand: a.brand.trim(), anchor: a.anchor.trim() }))
        .filter(a => a.url.length > 0);

      const { data, error } = await supabase.functions.invoke("generate-blog-post", {
        body: {
          prompt: topicPrompt.trim(),
          affiliates: cleanAffiliates.length > 0 ? cleanAffiliates : undefined,
        },
      });

      if (error) throw new Error(error.message || "Generation failed");
      if (data?.error) throw new Error(data.error);

      // Auto-fill all form fields
      if (data.title) { setTitle(data.title); setSlug(generateSlug(data.title)); }
      if (data.slug) setSlug(data.slug);
      if (data.category) setCategory(CATEGORIES.find(c => c.label === data.category) ? data.category : "Other");
      if (data.excerpt) setExcerpt(data.excerpt);
      if (data.read_time) setReadTime(data.read_time);
      if (data.tags) setTags(data.tags.join(", "));
      if (data.blocks) setBlocks(data.blocks);
      if (data.hero_image_url) setHeroPreview(data.hero_image_url);
      if (data.faq_items) setFaqItems(data.faq_items);
      if (data.internal_links) setInternalLinks(data.internal_links);
      if (data.primary_keyword) setPrimaryKeyword(data.primary_keyword);

      setTopicPrompt("");
      toast({ title: "✨ Article generated!", description: "Review everything below and publish when ready." });
    } catch (e: any) {
      console.error("Generate error:", e);
      toast({ title: "Generation failed", description: e.message || "Unknown error", variant: "destructive" });
    }
    setGenerating(false);
  };

  // Auto-format handler
  const handleAutoFormat = async () => {
    if (!rawText.trim()) {
      toast({ title: "No text", description: "Paste your article text first.", variant: "destructive" });
      return;
    }
    setFormatting(true);
    try {
      // 1. Upload all pool images to storage
      const uploadedUrls: string[] = [];
      for (const file of imagePool) {
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `inline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
        const { error } = await supabase.storage.from("blog-images").upload(fileName, file, { contentType: file.type });
        if (error) throw new Error(`Image upload failed: ${error.message}`);
        const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(fileName);
        uploadedUrls.push(pub.publicUrl);
      }

      // 2. Call the AI edge function
      const { data, error } = await supabase.functions.invoke("format-blog-post", {
        body: { rawText: rawText.trim(), imageCount: uploadedUrls.length },
      });

      if (error) throw new Error(error.message || "AI formatting failed");
      if (data?.error) throw new Error(data.error);

      // 3. Map IMAGE_X placeholders to actual URLs
      const formattedBlocks: ContentBlock[] = (data.blocks || []).map((block: ContentBlock) => {
        if (block.type === "image") {
          const match = block.value.match(/IMAGE_(\d+)/);
          if (match) {
            const idx = parseInt(match[1], 10);
            return { ...block, value: uploadedUrls[idx] || "" };
          }
        }
        return block;
      });

      // 4. Populate the editor
      setBlocks(formattedBlocks);
      if (data.excerpt) setExcerpt(data.excerpt);
      if (data.read_time) setReadTime(data.read_time);

      // Clear the raw input area
      setRawText("");
      setImagePool([]);
      imagePoolPreviews.forEach(u => URL.revokeObjectURL(u));
      setImagePoolPreviews([]);

      toast({ title: "✨ Article formatted!", description: "Review the blocks below and publish when ready." });
    } catch (e: any) {
      console.error("Auto-format error:", e);
      toast({ title: "Format failed", description: e.message || "Unknown error", variant: "destructive" });
    }
    setFormatting(false);
  };

  const addBlock = (type: "text" | "heading" | "image") => {
    setBlocks([...blocks, { type, value: "", caption: type === "image" ? "" : undefined }]);
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    setBlocks(blocks.map((b, i) => i === index ? { ...b, ...updates } : b));
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newI = index + direction;
    if (newI < 0 || newI >= blocks.length) return;
    const arr = [...blocks];
    [arr[index], arr[newI]] = [arr[newI], arr[index]];
    setBlocks(arr);
  };

  const uploadImageBlock = async (index: number, file: File) => {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `inline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(fileName, file, { contentType: file.type });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(fileName);
    updateBlock(index, { value: pub.publicUrl });
  };

  const resetForm = () => {
    setTitle(""); setSlug(""); setCategory("Guides"); setAuthor("Tom");
    setExcerpt(""); setReadTime("5 min read"); setTags(""); setCustomCategory("");
    setBlocks([{ type: "text", value: "" }]);
    setHeroFile(null); setHeroPreview(""); setEditingId(null);
    setRawText(""); setTopicPrompt("");
    setAffiliates([{ url: "", brand: "", anchor: "" }]);
    setFaqItems([]); setInternalLinks([]); setPrimaryKeyword("");
    setImagePool([]);
    imagePoolPreviews.forEach(u => URL.revokeObjectURL(u));
    setImagePoolPreviews([]);
  };

  const handlePublish = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({ title: "Missing fields", description: "Title and slug are required.", variant: "destructive" });
      return;
    }
    setPublishing(true);
    try {
      let heroUrl = heroPreview;
      if (heroFile) {
        const ext = heroFile.name.split(".").pop() || "jpg";
        const fileName = `hero-${slug}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("blog-images").upload(fileName, heroFile, { contentType: heroFile.type });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(fileName);
        heroUrl = pub.publicUrl;
      }

      const finalCategory = category === "Other" ? customCategory.trim() : category;
      const categoryColor = CATEGORIES.find(c => c.label === category)?.color || "bg-gray-500";
      const parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        category: finalCategory,
        category_color: categoryColor,
        hero_image_url: heroUrl || null,
        excerpt: excerpt.trim() || null,
        author: author.trim(),
        read_time: readTime.trim(),
        rich_content: blocks.filter(b => b.value.trim()),
        tags: parsedTags,
        date_published: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        faq_items: faqItems.length > 0 ? faqItems : [],
        internal_links: internalLinks.length > 0 ? internalLinks : [],
        primary_keyword: primaryKeyword.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase.from("blog_posts").update(payload as any).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Updated!", description: `"${title}" has been updated.` });
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload as any);
        if (error) throw error;
        toast({ title: "Published!", description: `"${title}" is now live on the blog.` });
      }
      resetForm();
      fetchPosts();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Unknown error", variant: "destructive" });
    }
    setPublishing(false);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setAuthor(post.author);
    setExcerpt(post.excerpt || "");
    setReadTime(post.read_time);
    setBlocks(post.rich_content?.length ? post.rich_content : [{ type: "text", value: "" }]);
    setTags((post as any).tags?.join(", ") || "");
    setFaqItems((post as any).faq_items || []);
    setInternalLinks((post as any).internal_links || []);
    setPrimaryKeyword((post as any).primary_keyword || "");
    setHeroPreview(post.hero_image_url || "");
    setHeroFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id) as any;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchPosts(); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          Content Studio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Create and manage blog articles.</p>
      </div>

      {/* Auto-Format Section */}
      <Card className="border-primary/30 bg-primary/5 border-l-4 border-l-primary">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> AI Article Assistant
          </h2>

          {/* Mode Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setAiMode("generate")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${aiMode === "generate" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Wand2 className="h-4 w-4" /> Generate from Topic
            </button>
            <button
              onClick={() => setAiMode("format")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${aiMode === "format" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Sparkles className="h-4 w-4" /> Format Existing Text
            </button>
          </div>

          {aiMode === "generate" ? (
            <>
              <p className="text-sm text-muted-foreground">
                Describe a topic and AI will research it, write a full article in your voice, and auto-fill every field below. Just review and publish.
              </p>
              <div>
                <Label>Topic / Prompt</Label>
                <Textarea
                  value={topicPrompt}
                  onChange={e => setTopicPrompt(e.target.value)}
                  placeholder="e.g. Write me a blog article on the current situation in Mexico and the impact it has on Canadian travellers..."
                  className="min-h-[120px] text-sm"
                />
              </div>

              {/* Affiliate Links (optional, up to 3) */}
              <div className="border border-border/60 rounded-lg p-4 space-y-4 bg-background/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Affiliate Links</span>
                  <span className="text-xs text-muted-foreground">
                    (optional, up to 3 — great for comparison or companion product articles)
                  </span>
                </div>

                {affiliates.map((aff, i) => (
                  <div key={i} className="space-y-3 border-t border-border/40 pt-3 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Product {i + 1}</span>
                      {(affiliates.length > 1 || aff.url || aff.brand || aff.anchor) && (
                        <button
                          type="button"
                          onClick={() => removeAffiliate(i)}
                          className="text-xs text-destructive hover:underline inline-flex items-center gap-1"
                        >
                          <X className="h-3 w-3" /> Remove
                        </button>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Affiliate URL</Label>
                      <Input
                        value={aff.url}
                        onChange={e => updateAffiliate(i, { url: e.target.value })}
                        placeholder="https://www.amazon.ca/dp/...?tag=reviewthengo-20"
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Brand / Product Name</Label>
                        <Input
                          value={aff.brand}
                          onChange={e => updateAffiliate(i, { brand: e.target.value })}
                          placeholder="EPICKA Universal Adapter"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Suggested Anchor Text</Label>
                        <Input
                          value={aff.anchor}
                          onChange={e => updateAffiliate(i, { anchor: e.target.value })}
                          placeholder="this travel adapter"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {affiliates.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAffiliate}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add another product
                  </Button>
                )}
              </div>

              <Button
                onClick={handleGenerateFromTopic}
                disabled={generating || !topicPrompt.trim()}
                className="gap-2"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {generating ? "Researching, Writing & Generating Images..." : "🔍 Generate Article"}
              </Button>
              {generating && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Searching the web, writing your article, and generating images. This may take 30-60 seconds...
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Paste your full article text and upload images. AI will structure it into a professional blog with headings, paragraphs, and images placed logically throughout.
              </p>

              <div>
                <Label>Article Text</Label>
                <Textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="Paste your entire article text here..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2"><ImagePlus className="h-4 w-4" /> Upload Images</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handleImagePoolAdd(e.target.files)}
                  className="text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:cursor-pointer mt-1"
                />
                {imagePoolPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {imagePoolPreviews.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt={`Pool ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-border" />
                        <button
                          onClick={() => removeFromImagePool(i)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-[10px] bg-background/80 text-foreground rounded px-1">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleAutoFormat}
                disabled={formatting || !rawText.trim()}
                className="gap-2"
              >
                {formatting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {formatting ? "Formatting..." : "✨ Auto-Format Article"}
              </Button>
            </>
          )}

          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            Or manually build your article using the block editor below.
          </p>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-foreground">{editingId ? "Edit Post" : "New Blog Post"}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Article title" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="url-slug" />
            </div>
            <div>
              <Label>Category</Label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
              {category === "Other" && (
                <Input value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Type custom category name..." className="mt-2" />
              )}
            </div>
            <div>
              <Label>Author</Label>
              <Input value={author} onChange={e => setAuthor(e.target.value)} />
            </div>
            <div>
              <Label>Read Time</Label>
              <Input value={readTime} onChange={e => setReadTime(e.target.value)} placeholder="5 min read" />
            </div>
            <div>
              <Label>Hero Image</Label>
              <input type="file" accept="image/*" onChange={e => handleHeroFile(e.target.files?.[0] || null)} className="text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:cursor-pointer" />
            </div>
          </div>

          {heroPreview && (
            <img src={heroPreview} alt="Hero preview" className="w-full h-48 object-cover rounded-lg" />
          )}

          <div>
            <Label>Excerpt</Label>
            <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short summary for the card..." className="min-h-[60px]" />
          </div>

          <div>
            <Label>SEO Tags / Keywords</Label>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Mexico all-inclusive 2026, best Cancun resorts, ..." />
            <p className="text-xs text-muted-foreground mt-1">Comma-separated keywords to help Google rank this article.</p>
          </div>

          <div>
            <Label>Primary Keyword</Label>
            <Input value={primaryKeyword} onChange={e => setPrimaryKeyword(e.target.value)} placeholder="e.g. best time to visit Cancun" />
            <p className="text-xs text-muted-foreground mt-1">The main keyword this article targets for SEO.</p>
          </div>

          {/* FAQ Items */}
          {faqItems.length > 0 && (
            <div>
              <Label className="mb-2 block">FAQ Items (for FAQPage schema)</Label>
              <div className="space-y-3">
                {faqItems.map((faq, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">FAQ {i + 1}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setFaqItems(faqItems.filter((_, j) => j !== i))}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input value={faq.question} onChange={e => setFaqItems(faqItems.map((f, j) => j === i ? { ...f, question: e.target.value } : f))} placeholder="Question..." />
                    <Textarea value={faq.answer} onChange={e => setFaqItems(faqItems.map((f, j) => j === i ? { ...f, answer: e.target.value } : f))} placeholder="Answer..." className="min-h-[60px]" />
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setFaqItems([...faqItems, { question: "", answer: "" }])}>
                <Plus className="h-3 w-3 mr-1" /> Add FAQ
              </Button>
            </div>
          )}

          {/* Block Editor */}
          <div>
            <Label className="mb-2 block">Article Content</Label>
            <div className="space-y-3">
              {blocks.map((block, i) => (
                <div key={i} className="flex gap-2 items-start bg-muted/30 rounded-lg p-3">
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(i, -1)} disabled={i === 0}><ArrowUp className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1}><ArrowDown className="h-3 w-3" /></Button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">{block.type}</span>
                    {block.type === "text" && (
                      <Textarea value={block.value} onChange={e => updateBlock(i, { value: e.target.value })} placeholder="Paragraph text..." className="min-h-[80px]" />
                    )}
                    {block.type === "heading" && (
                      <Input value={block.value} onChange={e => updateBlock(i, { value: e.target.value })} placeholder="Section heading..." />
                    )}
                    {block.type === "image" && (
                      <>
                        {block.value ? (
                          <div className="relative">
                            <img src={block.value} alt="Block" className="w-full h-48 object-cover rounded-xl" />
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                              onClick={() => updateBlock(i, { value: "" })}
                            >
                              Replace
                            </Button>
                          </div>
                        ) : (
                          <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImageBlock(i, f); }} className="text-sm text-muted-foreground" />
                        )}
                        <Input value={block.caption || ""} onChange={e => updateBlock(i, { caption: e.target.value })} placeholder="Image caption (optional)" />
                      </>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeBlock(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => addBlock("text")}><Plus className="h-3 w-3 mr-1" /> Text</Button>
              <Button variant="outline" size="sm" onClick={() => addBlock("heading")}><Plus className="h-3 w-3 mr-1" /> Heading</Button>
              <Button variant="outline" size="sm" onClick={() => addBlock("image")}><Plus className="h-3 w-3 mr-1" /> Image</Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handlePublish} disabled={publishing} className="gap-2">
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {editingId ? "Update Post" : "Publish"}
            </Button>
            {editingId && <Button variant="outline" onClick={resetForm}>Cancel Edit</Button>}
          </div>
        </CardContent>
      </Card>

      {/* Existing Posts */}
      <h2 className="font-display text-lg font-semibold text-foreground">Published Posts ({posts.length})</h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No blog posts yet. Create your first one above!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              {post.hero_image_url && <img src={post.hero_image_url} alt={post.title} className="w-full h-32 object-cover" />}
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground line-clamp-1">{post.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{post.category} · {post.date_published} · {post.read_time}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(`/compass/${post.slug}`, "_blank")} className="gap-1"><Eye className="h-3 w-3" /> View</Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegenerate(post)}
                    disabled={regeneratingId === post.id}
                    className="gap-1"
                  >
                    {regeneratingId === post.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    {regeneratingId === post.id ? "Regenerating..." : "Regenerate"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPostCreator;
