import React from 'react';
import { Lightbulb, TrendingUp, MessageSquare, Target, Users, Trophy } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface InsightsCardProps {
  onClick?: () => void;
}

const InsightsCard: React.FC<InsightsCardProps> = ({ onClick }) => {
  const { insightsData, socialMediaData, raceData, findCarReferences, findManufacturerReferences } = useData();

  if (!insightsData && !socialMediaData) return null;

  // Calculate some quick stats
  const totalPosts = socialMediaData?.posts.length || 0;
  const highPriorityPosts = socialMediaData?.posts.filter(post => post.priority === 'high').length || 0;
  const marketingAngles = insightsData?.marketing_angles.length || 0;
  
  // Count data relationships
  let totalReferences = 0;
  if (raceData) {
    raceData.fastest_by_car_number.forEach(car => {
      totalReferences += findCarReferences(car.car_number).length;
    });
    raceData.fastest_by_manufacturer.forEach(mfg => {
      totalReferences += findManufacturerReferences(mfg.manufacturer).length;
    });
  }

  return (
    <div 
      className="group relative bg-card rounded-3xl shadow-xl border border-border overflow-hidden transform transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl cursor-pointer theme-transition"
      onClick={onClick}
    >
      {/* Header Gradient */}
      <div className="h-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
      
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-xl">
                <Lightbulb className="h-8 w-8" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-card-foreground tracking-tight">Race Insights</h3>
              <p className="text-muted-foreground font-semibold">Strategic Analysis</p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {insightsData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-success" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Marketing Angles</span>
              </div>
              <p className="text-xl font-mono font-black text-card-foreground">{marketingAngles}</p>
            </div>
          )}

          {socialMediaData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Social Posts</span>
              </div>
              <p className="text-xl font-mono font-black text-card-foreground">{totalPosts}</p>
            </div>
          )}

          {socialMediaData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-red-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">High Priority</span>
              </div>
              <p className="text-xl font-mono font-black text-card-foreground">{highPriorityPosts}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-info" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Data Links</span>
            </div>
            <p className="text-xl font-mono font-black text-card-foreground">{totalReferences}</p>
          </div>
        </div>

        {/* Content Preview */}
        <div className="bg-muted/30 rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-card-foreground">Content Preview</span>
            <span className="text-xs text-muted-foreground bg-card px-3 py-1 rounded-full border font-medium">
              {insightsData && socialMediaData ? 'Full Suite' : insightsData ? 'Insights Only' : 'Social Only'}
            </span>
          </div>
          
          {insightsData && (
            <div className="mb-4">
              <p className="text-sm text-card-foreground font-medium line-clamp-3">
                {insightsData.executive_summary.substring(0, 120)}...
              </p>
            </div>
          )}

          {socialMediaData && socialMediaData.posts.length > 0 && (
            <div className="bg-card/50 rounded-lg p-3 border border-border/50">
              <p className="text-sm text-card-foreground font-medium line-clamp-2">
                "{socialMediaData.posts[0].text.substring(0, 80)}..."
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  socialMediaData.posts[0].priority === 'high' ? 'bg-red-500' :
                  socialMediaData.posts[0].priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <span className="text-xs text-muted-foreground capitalize">{socialMediaData.posts[0].priority} priority</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-600/0 group-hover:from-amber-500/5 group-hover:to-orange-600/10 transition-all duration-500 pointer-events-none" />
    </div>
  );
};

export default InsightsCard;