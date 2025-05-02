"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast"; // Assuming the correct hook path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash } from "lucide-react";

interface WebsiteSettings {
  id: string; // Assuming a single row with a fixed ID
  site_title: string;
  site_description: string;
  meta_tags: string; // Or string[], or a more complex structure if needed
  promotions: { id: string; title: string; description: string; active: boolean; }[]; // Example structure for promotions
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [metaTags, setMetaTags] = useState("");
  const [promotions, setPromotions] = useState<WebsiteSettings['promotions']>([]); // State for managing promotions

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdminAccessAndFetchSettings = async () => {
      try {
        // Check admin access (similar to other admin pages)
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          router.push("/login");
          return;
        }
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", authData.user.id)
          .single();
        if (userError || userData?.role !== "admin") {
          toast({ title: "Access denied", description: "You do not have permission to access this page", variant: "destructive" });
          router.push("/dashboard");
          return;
        }

        // Fetch settings
        await fetchSettings();

      } catch (error) {
        console.error("Error checking admin access or fetching settings:", error);
        toast({ title: "Error", description: "Could not load settings.", variant: "destructive" });
        router.push("/dashboard"); // Redirect on significant error
      } // No finally here to let loading remain true on error before redirect
    };

    checkAdminAccessAndFetchSettings();
  }, [router, supabase, toast]);

  const fetchSettings = async () => {
     setLoading(true); // Set loading true before fetching
     try {
       const { data, error } = await supabase
         .from("settings")
         .select("*")
         .single(); // Assuming a single row for settings

       if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
         throw error;
       }

       if (data) {
         setSettings(data);
         setSiteTitle(data.site_title);
         setSiteDescription(data.site_description);
         setMetaTags(data.meta_tags);
         // Ensure promotions is always an array
         setPromotions(Array.isArray(data.promotions) ? data.promotions : []);
       } else {
         // If no settings found, initialize with empty values and a default structure
         setSettings(null);
         setSiteTitle("");
         setSiteDescription("");
         setMetaTags("");
         setPromotions([]);
       }
     } catch (error: any) {
       console.error("Error fetching settings:", error);
       toast({ title: "Error", description: error.message || "Could not fetch website settings.", variant: "destructive" });
     } finally {
       setLoading(false);
     }
  };


  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settingsDataToSave = {
        site_title: siteTitle,
        site_description: siteDescription,
        meta_tags: metaTags,
        promotions: promotions, // Save the promotions array
      };

      let error = null;
      let data = null;

      // Using a fixed ID for upsert (e.g., 'website_config')
      const fixedSettingsId = 'website_config';

      const { data: upsertData, error: upsertError } = await supabase
        .from('settings')
        .upsert({ id: fixedSettingsId, ...settingsDataToSave }, { onConflict: 'id' })
        .select()
        .single();

      data = upsertData;
      error = upsertError;


      if (error) {
        throw error;
      }

      setSettings(data); // Update local state with saved data
      toast({ title: "Settings saved", description: "Website settings updated successfully." });

       // Potentially refresh the page or parts of the UI that depend on these settings
       // router.refresh(); // Commenting this out for now, may not be necessary immediately

    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({ title: "Error saving settings", description: error.message || "Could not save website settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Handlers for managing promotions
  const handleAddPromotion = () => {
      setPromotions([...promotions, { id: Date.now().toString(), title: '', description: '', active: true }]); // Simple ID generation
  };

  const handleUpdatePromotion = (id: string, field: keyof WebsiteSettings['promotions'][0], value: any) => {
      setPromotions(promotions.map(promo => promo.id === id ? { ...promo, [field]: value } : promo));
  };

  const handleRemovePromotion = (id: string) => {
      setPromotions(promotions.filter(promo => promo.id !== id));
  };


  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-full max-w-md mb-8" />
        <Card>
          <CardHeader>
             <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" /> {/* Promotions section */}
          </CardContent>
        </Card>
         <Skeleton className="h-10 w-24 mt-6 ml-auto" />
      </div>
    );
  }


  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Website Settings</h1>
        <p className="text-muted-foreground">Manage general website configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="site-title">Site Title</Label>
            <Input id="site-title" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Textarea id="site-description" value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="meta-tags">Meta Tags (comma-separated)</Label>
            <Input id="meta-tags" value={metaTags} onChange={(e) => setMetaTags(e.target.value)} placeholder="smm panel, social media, services" />
          </div>

           {/* Promotions Section */}
           <div className="grid gap-4 border-t pt-4 mt-4">
               <div className="flex items-center justify-between">
                   <Label>Promotions</Label>
                   <Button variant="outline" size="sm" onClick={handleAddPromotion}>Add Promotion</Button>
               </div>
               {promotions.length === 0 && <p className="text-sm text-muted-foreground">No promotions added yet.</p>}
               {promotions.map((promo, index) => (
                   <div key={promo.id} className="grid gap-2 border rounded-md p-4 relative">
                       <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemovePromotion(promo.id)}>
                           <Trash className="h-4 w-4 text-destructive" />
                       </Button>
                       <div className="grid gap-2">
                           <Label htmlFor={`promo-title-${promo.id}`}>Title</Label>
                           <Input id={`promo-title-${promo.id}`} value={promo.title} onChange={(e) => handleUpdatePromotion(promo.id, 'title', e.target.value)} />
                       </div>
                       <div className="grid gap-2">
                           <Label htmlFor={`promo-description-${promo.id}`}>Description</Label>
                           <Textarea id={`promo-description-${promo.id}`} value={promo.description} onChange={(e) => handleUpdatePromotion(promo.id, 'description', e.target.value)} rows={2} />
                       </div>
                        {/* Add an active toggle if needed */}
                        {/*
                       <div className="flex items-center gap-2">
                            <input type="checkbox" id={`promo-active-${promo.id}`} checked={promo.active} onChange={(e) => handleUpdatePromotion(promo.id, 'active', e.target.checked)} />
                           <Label htmlFor={`promo-active-${promo.id}`}>Active</Label>
                       </div>
                        */}
                   </div>
               ))}
           </div>


        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}