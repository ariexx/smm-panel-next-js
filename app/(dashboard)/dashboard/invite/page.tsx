"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Copy, Share2, UserPlus, Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface ReferredUser {
  id: string;
  username: string;
  email: string;
  referred_action_completed: boolean;
  created_at: string;
}

interface ReferralReward {
  description: string;
  referrals_required: number;
  type: 'discount' | 'balance' | 'other';
  value: number | string;
  unlocked: boolean;
}

const DEFAULT_REWARDS = [
  { description: "$5 Account Credit", referrals_required: 5, type: 'balance', value: 5 },
  { description: "10% Discount on Orders", referrals_required: 10, type: 'discount', value: 10 },
  { description: "$15 Account Credit", referrals_required: 15, type: 'balance', value: 15 },
  { description: "Free Premium Service", referrals_required: 25, type: 'other', value: "Premium" },
];

export default function InvitePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [referralLink, setReferralLink] = useState("");
  const [rewards, setRewards] = useState<ReferralReward[]>([]);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the current authenticated user
        const { data: authData } = await supabase.auth.getUser();

        if (!authData.user) {
          router.push("/login");
          return;
        }

        // Get the user profile data
        const { data: userData, error } = await supabase
          .from("users")
          .select("id, username, email, referral_code, qualifying_referrals_count")
          .eq("id", authData.user.id)
          .single();

        if (error) {
          throw error;
        }

        setUser(userData);

        // Generate referral link
        if (userData?.referral_code) {
          setReferralLink(`${window.location.origin}/register?ref=${userData.referral_code}`);
        }

        // Fetch referred users
        const { data: referredData, error: referredError } = await supabase
          .from("users")
          .select("id, username, email, referred_action_completed, created_at")
          .eq("referred_by", authData.user.id)
          .order("created_at", { ascending: false });

        if (referredError) {
          throw referredError;
        }

        setReferredUsers(referredData || []);

        // Process rewards
        const qualifyingCount = userData?.qualifying_referrals_count || 0;
        const processedRewards = DEFAULT_REWARDS.map(reward => ({
          ...reward,
          unlocked: qualifyingCount >= reward.referrals_required
        }));
        setRewards(processedRewards);

      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: error.message || "Could not load referral information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, supabase, toast]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
    });
  };

  // Basic share functionality
  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join SocialBoost',
        text: 'Join SocialBoost and boost your social media presence!',
        url: referralLink,
      }).catch((error) => console.error('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      copyReferralLink();
    }
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
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextReward = rewards.find(reward => !reward.unlocked);
  const qualifyingCount = user?.qualifying_referrals_count || 0;
  const nextRewardCount = nextReward?.referrals_required || 0;
  const progressPercent = nextRewardCount > 0 ? (qualifyingCount / nextRewardCount) * 100 : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Invite Friends & Earn Rewards</h1>
        <p className="text-muted-foreground">Share your referral link and earn rewards when your friends join and place their first order.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>Share this link with your friends to invite them.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input value={referralLink} readOnly />
                <Button onClick={copyReferralLink}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
                {navigator.share && (
                  <Button variant="outline" size="icon" onClick={shareReferralLink}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {user && !user.referral_code && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Referral Code Missing</AlertTitle>
                  <AlertDescription>
                    Your account doesn't have a referral code yet. Please contact support.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Referral Progress</CardTitle>
              <CardDescription>
                You have {qualifyingCount} qualifying referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nextReward ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span>Next Reward: {nextReward.description}</span>
                    <span>
                      {qualifyingCount} / {nextReward.referrals_required} Referrals
                    </span>
                  </div>
                  <Progress value={progressPercent} />
                </div>
              ) : (
                <div>
                  <p>You've unlocked all rewards! Thank you for your referrals.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="rewards">
            <TabsList className="mb-4">
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="users">Referred Users</TabsTrigger>
            </TabsList>

            <TabsContent value="rewards">
              <Card>
                <CardHeader>
                  <CardTitle>Available Rewards</CardTitle>
                  <CardDescription>Unlock these by referring friends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rewards.map((reward, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <Gift className={`h-5 w-5 ${reward.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div>
                            <p className="font-medium">{reward.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Requires {reward.referrals_required} referrals
                            </p>
                          </div>
                        </div>
                        <Badge variant={reward.unlocked ? "default" : "outline"}>
                          {reward.unlocked ? "Unlocked" : "Locked"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Referred Users</CardTitle>
                  <CardDescription>
                    You've invited {referredUsers.length} users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {referredUsers.length === 0 ? (
                    <div className="text-center py-4">
                      <UserPlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">You haven't referred anyone yet. Share your link to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {referredUsers.map((referredUser) => (
                        <div key={referredUser.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{referredUser.username}</p>
                              <p className="text-sm text-muted-foreground">
                                Joined {new Date(referredUser.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={referredUser.referred_action_completed ? "default" : "outline"}>
                              {referredUser.referred_action_completed ? "Qualified" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}