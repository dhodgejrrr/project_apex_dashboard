import React from 'react';
import { useData } from '../contexts/DataContext';
import { Lightbulb, TrendingUp, Target, MessageSquare, AlertCircle, FileText, Users, Trophy } from 'lucide-react';

const InsightsDashboard: React.FC = () => {
  const { raceData, insightsData, socialMediaData, findCarReferences, findManufacturerReferences } = useData();

  if (!raceData) return null;

  // Show message if no insights data is available
  if (!insightsData && !socialMediaData) {
    return (
      <div className="space-y-12">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-racing">Race Insights</h1>
                <p className="text-orange-100 text-lg mt-2">Strategic analysis and social media content</p>
              </div>
            </div>
          </div>
        </div>

        {/* No Data Message */}
        <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-4">No Insights Data Available</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Upload insights and social media files to see strategic analysis, marketing angles, and social media content based on race performance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-muted/30 rounded-2xl p-6">
                <TrendingUp className="h-8 w-8 text-info mb-3 mx-auto" />
                <h4 className="font-bold text-card-foreground mb-2">Race Insights</h4>
                <p className="text-sm text-muted-foreground">Executive summaries and strategic marketing angles</p>
              </div>
              <div className="bg-muted/30 rounded-2xl p-6">
                <MessageSquare className="h-8 w-8 text-success mb-3 mx-auto" />
                <h4 className="font-bold text-card-foreground mb-2">Social Media</h4>
                <p className="text-sm text-muted-foreground">Generated posts and content for social platforms</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-racing">Race Insights</h1>
              <p className="text-orange-100 text-lg mt-2">Strategic analysis and social media content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Executive Summary */}
        {insightsData && (
          <div className="space-y-8">
            <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
              <div className="p-8 border-b border-border bg-gradient-to-r from-info/10 to-info/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-info/20 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-card-foreground tracking-tight">Executive Summary</h3>
                    <p className="text-muted-foreground font-medium">Strategic race analysis overview</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-card-foreground leading-relaxed text-lg font-medium">
                    {insightsData.executive_summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Marketing Angles */}
            <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
              <div className="p-8 border-b border-border bg-gradient-to-r from-success/10 to-success/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-card-foreground tracking-tight">Marketing Angles</h3>
                    <p className="text-muted-foreground font-medium">Strategic messaging opportunities</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-4">
                  {insightsData.marketing_angles.map((angle, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                      <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-success font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-card-foreground font-medium leading-relaxed">{angle}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social Media Content */}
        {socialMediaData && (
          <div className="space-y-8">
            <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
              <div className="p-8 border-b border-border bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-card-foreground tracking-tight">Social Media Posts</h3>
                    <p className="text-muted-foreground font-medium">{socialMediaData.posts.length} generated posts</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  {socialMediaData.posts.slice(0, 10).map((post, index) => {
                    // Find related race data
                    const carMatches = post.text.match(/#(\d+)/g);
                    const relatedCars = carMatches ? carMatches.map(match => match.replace('#', '')) : [];
                    
                    return (
                      <div key={index} className="border border-border rounded-2xl overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                post.priority === 'high' ? 'bg-red-500' :
                                post.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`} />
                              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                {post.priority} Priority
                              </span>
                            </div>
                            {post.needs_visual && (
                              <div className="flex items-center gap-2 px-3 py-1 bg-info/10 rounded-full">
                                <div className="w-2 h-2 bg-info rounded-full" />
                                <span className="text-xs font-medium text-info">Visual Content</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-card-foreground leading-relaxed mb-4 text-lg">
                            {post.text}
                          </p>
                          
                          {relatedCars.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-muted-foreground">Related cars:</span>
                              {relatedCars.map((carNumber, carIndex) => {
                                const carData = raceData.fastest_by_car_number.find(car => car.car_number === carNumber);
                                return (
                                  <span key={carIndex} className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                                    #{carNumber} {carData ? `(${carData.fastest_lap.driver_name})` : ''}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          
                          {post.visual_type && (
                            <div className="mt-4 p-3 bg-muted/30 rounded-xl">
                              <p className="text-sm font-medium text-muted-foreground">
                                <strong>Visual Type:</strong> {post.visual_type}
                              </p>
                              {post.visual_params && Object.keys(post.visual_params).length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-muted-foreground">Visual Parameters:</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {Object.entries(post.visual_params).map(([key, value]) => (
                                      <span key={key} className="px-2 py-1 bg-muted rounded text-xs font-mono">
                                        {key}: {String(value)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Social Media Metadata */}
            <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden theme-transition">
              <div className="p-6 border-b border-border">
                <h4 className="text-lg font-bold text-card-foreground">Generation Metadata</h4>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Generation Method:</span>
                    <p className="font-mono text-card-foreground">{socialMediaData.metadata.generation_method}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Attempts:</span>
                    <p className="font-mono text-card-foreground">{socialMediaData.metadata.attempts}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-muted-foreground">Final Critique:</span>
                    <div className="flex items-center gap-2 mt-1">
                      {socialMediaData.metadata.final_critique.approved ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className="text-green-600 font-medium">Approved</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className="text-red-600 font-medium">Not Approved</span>
                        </div>
                      )}
                    </div>
                    <p className="text-card-foreground mt-2">{socialMediaData.metadata.final_critique.feedback}</p>
                  </div>
                  {socialMediaData.metadata.warning && (
                    <div className="md:col-span-2 p-4 bg-warning/10 border border-warning/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-warning">Warning</p>
                          <p className="text-card-foreground text-sm mt-1">{socialMediaData.metadata.warning}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Relationships */}
      {(insightsData || socialMediaData) && (
        <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
          <div className="p-8 border-b border-border bg-gradient-to-r from-muted/50 to-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-card-foreground tracking-tight">Data Relationships</h3>
                <p className="text-muted-foreground font-medium">Connections between insights and race data</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Car References */}
              <div>
                <h4 className="text-lg font-bold text-card-foreground mb-4">Referenced Cars</h4>
                <div className="space-y-3">
                  {raceData.fastest_by_car_number.slice(0, 5).map(car => {
                    const references = findCarReferences(car.car_number);
                    if (references.length === 0) return null;
                    
                    return (
                      <div key={car.car_number} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">#{car.car_number}</span>
                          </div>
                          <span className="font-medium text-card-foreground">{car.fastest_lap.driver_name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{references.length} references</span>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              </div>

              {/* Manufacturer References */}
              <div>
                <h4 className="text-lg font-bold text-card-foreground mb-4">Referenced Manufacturers</h4>
                <div className="space-y-3">
                  {raceData.fastest_by_manufacturer.slice(0, 5).map(mfg => {
                    const references = findManufacturerReferences(mfg.manufacturer);
                    if (references.length === 0) return null;
                    
                    return (
                      <div key={mfg.manufacturer} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-success" />
                          </div>
                          <span className="font-medium text-card-foreground">{mfg.manufacturer}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{references.length} references</span>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsDashboard;